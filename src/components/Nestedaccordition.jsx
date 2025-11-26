import React, { useState } from "react";

const NestedAccordion = ({ category, onSelectSubcategory, activeSubcategory }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-2">
      {/* Category Title */}
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex justify-between items-center py-2 px-1 font-semibold ${
          open ? "text-purple-600" : "text-gray-800"
        }`}
      >
        <span>{category.name}</span>

        <svg
          className={`w-4 h-4 transition-transform ${
            open ? "rotate-180" : "rotate-0"
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* Subcategories */}
      <div
        className={`transition-all overflow-hidden ${
          open ? "max-h-[500px]" : "max-h-0"
        }`}
      >
        <div className="pl-4 mt-1">
          {category.subcategories.map((sub) => {
            const isActive = activeSubcategory?.id === sub.id;
            return (
              <div
                key={sub.id}
                onClick={() => onSelectSubcategory(category.name, sub)}
                className={`py-1 cursor-pointer text-sm ${
                  isActive
                    ? "text-purple-600 font-medium"
                    : "text-gray-600 hover:text-purple-600"
                }`}
              >
                {sub.name}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NestedAccordion;
