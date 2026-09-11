import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import useDebounce from "../../hooks/useDebounce";
import { fetchData } from "../../utils";

const AutoComplete = () => {
  const containerRef = useRef(null);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [query, setQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const [isOpen, setIsOpen] = useState(false);

  // Currently highlighted suggestion
  const [activeIndex, setActiveIndex] = useState(-1);

  const debounceQuery = useDebounce(query, 500);

  // ----------------------------------
  // Handle typing
  // ----------------------------------
  const handleQuery = (e) => {
    const value = e.target.value;

    setQuery(value);
    setSelectedUser(null);
    setError(null);
    setIsOpen(true);
    setActiveIndex(-1);
  };

  // ----------------------------------
  // API
  // ----------------------------------
  useEffect(() => {
    if (!debounceQuery.trim()) {
      setUsers([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    setLoading(true);

    fetchData(
      `https://dummyjson.com/users/search?q=${encodeURIComponent(
        debounceQuery
      )}`,
      controller.signal
    )
      .then((data) => {
        setUsers(data.users || []);
        setActiveIndex(-1);
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setError(error);
          setUsers([]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [debounceQuery]);


  const handleSelect = (user) => {
    const fullName = `${user.firstName} ${user.lastName}`;

    setSelectedUser(user);
    setQuery(fullName);

    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (!isOpen || users.length === 0) {
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();

      setActiveIndex((prev) => {
        // First item
        if (prev === -1) {
          return 0;
        }

        // Last item
        if (prev === users.length - 1) {
          return prev;
        }

        return prev + 1;
      });

      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();

      setActiveIndex((prev) => {
        // First item
        if (prev <= 0) {
          return 0;
        }

        return prev - 1;
      });

      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();

      if (activeIndex >= 0) {
        handleSelect(users[activeIndex]);
      }
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="autocomplete"
    >
      <input
        type="text"
        placeholder="Search users..."
        value={query}
        onChange={handleQuery}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        // role="combobox"
        // aria-expanded={isOpen}
        // aria-autocomplete="list"
        // aria-controls="autocomplete-list"
        // aria-activedescendant={
        //   activeIndex >= 0
        //     ? `autocomplete-option-${users[activeIndex].id}`
        //     : undefined
        // }
      />

      {isOpen && (
        <div
          id="autocomplete-list"
          className="suggestions"
          role="listbox"
        >
          {loading && (
            <div className="loading">
              Loading...
            </div>
          )}

          {!loading && error && (
            <div className="error">
              Error fetching users
            </div>
          )}

          {!loading &&
            !error &&
            users.length > 0 &&
            users.map((user, index) => {
              const isActive =
                activeIndex === index;

              return (
                <div
                  key={user.id}
                  id={`autocomplete-option-${user.id}`}
                  className={`suggestion ${
                    isActive ? "active" : ""
                  }`}
                  role="option"
                  aria-selected={isActive}
                  onMouseEnter={() =>
                    setActiveIndex(index)
                  }
                  onMouseDown={() =>
                    handleSelect(user)
                  }
                >
                  {user.firstName} {user.lastName}
                </div>
              );
            })}

          {!loading &&
            !error &&
            debounceQuery &&
            users.length === 0 && (
              <div className="no-results">
                No results found
              </div>
            )}
        </div>
      )}

      {selectedUser && (
        <div className="selected-user">
          <h3>Selected User</h3>

          <p>
            <strong>Name:</strong>{" "}
            {selectedUser.firstName}{" "}
            {selectedUser.lastName}
          </p>

          <p>
            <strong>Email:</strong>{" "}
            {selectedUser.email}
          </p>
        </div>
      )}
    </div>
  );
};

export default AutoComplete;