import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";

const baseMenuSections = [
  {
    title: "Core",
    items: [
      { name: "Dashboard", icon: "🏛️", path: "/" },
      {
        name: "Donors",
        icon: "👤",
        path: "/donors",
        submenu: [
          { name: "Add Donor", path: "/donors/add", icon: "➕" },
          { name: "Manage Donors", path: "/donors/manage", icon: "📋" },
        ],
      },
      {
        name: "Donations",
        icon: "💰",
        path: "/donations",
        submenu: [
          { name: "Quick Donation", path: "/donations/quick", icon: "⚡" },
          { name: "Donation List", path: "/donations/list", icon: "📄" },
          { name: "New Donation", path: "/donations/new", icon: "➕" },
          { name: "Bulk Import", path: "/donations/import", icon: "📂" },
        ],
      },
    ],
  },
  {
    title: "Programs",
    items: [
      { name: "Events", icon: "📅", path: "/events" },
      { name: "Registrations", icon: "📝", path: "/registrations" },
    ],
  },
];

function Sidebar({ isOpen, onToggle, auth, onLogout }) {
  const [openSubmenu, setOpenSubmenu] = useState(null);

  // Build final menu sections with admin-only entry
  const menuSections = useMemo(() => {
    const sections = [...baseMenuSections];

    const adminSection = {
      title: "Administration",
      items: [
        { name: "Reports", icon: "📊", path: "/reports" },
        { name: "Settings", icon: "⚙️", path: "/settings" },
      ],
    };

    // Only admins see Users & Access
    if (auth?.role === "Admin") {
      adminSection.items.push({
        name: "Users & Access",
        icon: "👥",
        path: "/admin/users",
      });
    }

    sections.push(adminSection);
    return sections;
  }, [auth?.role]);

  const handleSubmenuToggle = (key) => {
    setOpenSubmenu((prev) => (prev === key ? null : key));
  };

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        width: isOpen ? 240 : 70,
        backgroundColor: "var(--color-beige)",
        borderRight: "2px solid var(--color-saffron)",
        boxSizing: "border-box",
        transition: "width 0.25s ease",
        zIndex: 1000,
        color: "var(--color-dark-brown)",
        overflow: "hidden",
      }}
    >
      {/* Header: logo + toggle */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0.75rem 0.75rem",
          borderBottom: "1px solid var(--color-saffron)",
          gap: "0.5rem",
        }}
      >
        <div
          style={{
            height: 48,
            minWidth: 48,
            maxWidth: 48,
            borderRadius: 8,
            backgroundColor: "var(--color-saffron)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--color-text-light)",
            fontFamily: "var(--font-heading)",
            fontSize: isOpen ? 16 : 22,
            fontWeight: "bold",
            flexShrink: 0,
          }}
        >
          {isOpen ? "Logo" : "🛕"}
        </div>

        {isOpen && (
          <div
            style={{
              flex: 1,
              fontFamily: "var(--font-heading)",
              fontWeight: "bold",
              fontSize: 16,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            RAMA
          </div>
        )}

        <button
          onClick={onToggle}
          title={isOpen ? "Collapse menu" : "Expand menu"}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontSize: 20,
            padding: 4,
            color: "var(--color-dark-brown)",
          }}
        >
          ☰
        </button>
      </div>

      {/* Menu sections */}
      <div
        style={{
          padding: "0.5rem 0.5rem 1rem",
          height: "calc(100vh - 72px)",
          overflowY: "auto",
          boxSizing: "border-box",
        }}
      >
        {menuSections.map((section, sIdx) => (
          <div key={section.title} style={{ marginBottom: "0.75rem" }}>
            {isOpen && (
              <div
                style={{
                  fontSize: 12,
                  textTransform: "uppercase",
                  color: "#7b6a5a",
                  margin: "0.5rem 0.5rem",
                  letterSpacing: 1,
                }}
              >
                {section.title}
              </div>
            )}

            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {section.items.map((item, idx) => {
                const key = `${sIdx}-${idx}`;
                const hasSub = !!item.submenu;
                const isSubOpen = openSubmenu === key;

                return (
                  <li key={key} style={{ marginBottom: 6 }}>
                    {/* Main menu card */}
                    <div
                      onClick={() =>
                        hasSub && isOpen ? handleSubmenuToggle(key) : null
                      }
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: isOpen ? "0.6rem" : 0,
                        padding: "0.6rem 0.85rem",
                        borderRadius: 10,
                        cursor: hasSub ? "pointer" : "default",
                        background:
                          hasSub && isSubOpen
                            ? "linear-gradient(90deg, var(--color-saffron) 0%, #ffd95a 100%)"
                            : "transparent",
                        color: "var(--color-dark-brown)",
                        boxShadow:
                          hasSub && isSubOpen
                            ? "0 2px 6px rgba(0,0,0,0.15)"
                            : "none",
                        transition:
                          "background 0.25s ease, box-shadow 0.25s ease, transform 0.1s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (!isOpen) return;
                        if (!hasSub || !isSubOpen) {
                          e.currentTarget.style.background =
                            "linear-gradient(90deg, #ffe082 0%, #ffecb3 100%)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isOpen) return;
                        e.currentTarget.style.background =
                          hasSub && isSubOpen
                            ? "linear-gradient(90deg, var(--color-saffron) 0%, #ffd95a 100%)"
                            : "transparent";
                      }}
                    >
                      <span style={{ fontSize: 20 }}>{item.icon}</span>
                      {isOpen && (
                        <Link
                          to={item.path}
                          style={{ flex: 1, fontWeight: 600, fontSize: 15 }}
                        >
                          {item.name}
                        </Link>
                      )}
                      {hasSub && isOpen && (
                        <span style={{ fontSize: 12 }}>
                          {isSubOpen ? "▲" : "▼"}
                        </span>
                      )}
                    </div>

                    {/* Submenu cards */}
                    {hasSub && isOpen && isSubOpen && (
                      <ul
                        style={{
                          listStyle: "none",
                          paddingLeft: 14,
                          marginTop: 6,
                        }}
                      >
                        {item.submenu.map((sub) => (
                          <li key={sub.name} style={{ marginBottom: 4 }}>
                            <Link
                              to={sub.path}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                padding: "0.45rem 0.75rem",
                                borderRadius: 8,
                                backgroundColor: "#fffdf3",
                                fontSize: 14,
                                color: "var(--color-dark-brown)",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                                transition:
                                  "background-color 0.2s ease, transform 0.1s ease",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#ffe9a8";
                                e.currentTarget.style.transform =
                                  "translateX(2px)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#fffdf3";
                                e.currentTarget.style.transform =
                                  "translateX(0)";
                              }}
                            >
                              <span>{sub.icon}</span>
                              <span>{sub.name}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}

export default Sidebar;