import { useState } from "react";
import BookingModal from "../components/BookingModal.jsx";
import ProviderDetailsModal from "../components/ProviderDetailsModal.jsx";

// Shared hook + modal host for booking + provider-details flows.
export function useBookingModals() {
  const [bookingProvider, setBookingProvider] = useState(null);
  const [detailsProvider, setDetailsProvider] = useState(null);

  const openBooking = (provider) => setBookingProvider(provider);
  const closeBooking = () => setBookingProvider(null);
  const openDetails = (provider) => setDetailsProvider(provider);
  const closeDetails = () => setDetailsProvider(null);

  // When "Book This Provider" is clicked inside the details modal,
  // swap from details -> booking for the same provider.
  const bookFromDetails = (provider) => {
    setDetailsProvider(null);
    setBookingProvider(provider);
  };

  const modals = (
    <>
      <BookingModal
        provider={bookingProvider}
        open={!!bookingProvider}
        onClose={closeBooking}
      />
      <ProviderDetailsModal
        provider={detailsProvider}
        open={!!detailsProvider}
        onClose={closeDetails}
        onBook={bookFromDetails}
      />
    </>
  );

  return { openBooking, openDetails, modals };
}
