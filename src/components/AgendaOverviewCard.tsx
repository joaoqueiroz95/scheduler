import React from "react";

export default function AgendaOverviewCard() {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Card Title</h2>
        <ul className="list-disc ml-6 mb-4">
          <li>Item 1</li>
          <li>Item 2</li>
          <li>Item 3</li>
          <li>Item 4</li>
        </ul>
        <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
          Show More
        </button>
      </div>
    </div>
  );
}
