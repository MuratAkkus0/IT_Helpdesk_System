import React, { useState, createContext } from "react";
import { useNavigate } from "react-router-dom";
import TicketList from "@/components/organisms/TicketList";
import type { Ticket } from "../types";

// Context for sharing search state
export const SearchContext = createContext({
  searchQuery: "",
  setSearchQuery: (_query: string) => {},
});

const TicketsPage: React.FC = () => {
  const navigate = useNavigate();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const handleTicketSelect = (ticket: Ticket) => {
    navigate(`/tickets/${ticket._id}`);
  };

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery }}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
        </div>

        <TicketList
          refreshTrigger={refreshTrigger}
          searchQuery={searchQuery}
          onTicketSelect={handleTicketSelect}
          onRefresh={handleRefresh}
        />
      </div>
    </SearchContext.Provider>
  );
};

export default TicketsPage;
