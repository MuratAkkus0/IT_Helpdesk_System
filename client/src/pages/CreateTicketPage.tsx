import React from "react";
import TicketForm from "../components/organisms/TicketForm";

const CreateTicketPage: React.FC = () => {
  const handleTicketCreated = (): void => {
    // Handle ticket creation success
    // Could redirect to tickets page or show success message
  };

  return (
    <div className="space-y-6">
      <TicketForm onTicketCreated={handleTicketCreated} />
    </div>
  );
};

export default CreateTicketPage;
