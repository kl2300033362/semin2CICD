import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import Carousel from "./Carousel";
import FloatingBubbles from './FloatingBubbles';
import Footer from "../NavbarComponent/Footer";
import { useNavigate } from "react-router-dom";
import TourCard from "../TourComponent/TourCard";

const HomePage = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);

  const [eventName, setEventName] = useState("");
  const [eventFromLocationId, setEventFromLocationId] = useState("");
  const [eventToLocationId, setEventToLocationId] = useState("");

  const [tempEventName, setTempEventName] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [tempEventFromLocationId, setTempEventFromLocationId] = useState("");
  const [tempEventToLocationId, setTempEventToLocationId] = useState("");
  const [tempEventFromLocationName, setTempEventFromLocationName] = useState("");
  const [tempEventToLocationName, setTempEventToLocationName] = useState("");

  const [tours, setTours] = useState([]);

  const retrieveAllLocations = async () => {
    try {
      const response = await api.get(`/api/location/fetch/all`);
      return response.data;
    } catch (error) {
      // api interceptor will already show a toast; keep UI stable
      // Return null so callers can handle absence of data
      // eslint-disable-next-line no-console
      console.warn('Failed to fetch locations', error?.message || error);
      return null;
    }
  };

  useEffect(() => {
    const getAllEvents = async () => {
      try {
        const allEvents = await retrieveAllEvents();
        if (allEvents) setTours(allEvents.tours || []);
      } catch (error) {
        // already handled by retrieveAllEvents; ensure state is safe
        setTours([]);
      }
    };

    const getSearchedEvents = async () => {
      try {
        const allEvents = await searchEvents();
        if (allEvents) setTours(allEvents.tours || []);
      } catch (error) {
        setTours([]);
      }
    };

    const getAllLocations = async () => {
      try {
        const resLocation = await retrieveAllLocations();
        if (resLocation) setLocations(resLocation.locations || []);
      } catch (error) {
        setLocations([]);
      }
    };

    if (
      eventFromLocationId !== "" ||
      eventToLocationId !== "" ||
      eventName !== ""
    ) {
      getSearchedEvents();
    } else {
      getAllEvents();
    }

    getAllLocations();
  }, [eventFromLocationId, eventToLocationId, eventName]);

  const retrieveAllEvents = async () => {
    try {
      const response = await api.get(`/api/tour/fetch/all/active`);
      return response.data;
    } catch (error) {
      // api interceptor will show toast; return null for callers
      // eslint-disable-next-line no-console
      console.warn('Failed to fetch events', error?.message || error);
      return null;
    }
  };

  const searchEvents = async () => {
    if (eventName !== "") {
      try {
        const response = await api.get(
          `/api/tour/fetch/name-wise?tourName=${encodeURIComponent(
            eventName
          )}`
        );
        return response.data;
      } catch (error) {
        console.warn('Failed to search events by name', error?.message || error);
        return null;
      }
    } else if (
      eventFromLocationId !== "" ||
      eventFromLocationId !== "0" ||
      eventToLocationId !== "" ||
      eventToLocationId !== "0"
    ) {
      try {
        const response = await api.get(
          `/api/tour/fetch/location-wise?fromLocationId=${encodeURIComponent(
            eventFromLocationId
          )}&toLocationId=${encodeURIComponent(eventToLocationId)}`
        );
        return response.data;
      } catch (error) {
        console.warn('Failed to search events by location', error?.message || error);
        return null;
      }
    }
  };

  const searchEventByName = (e) => {
    e.preventDefault();
    setEventName(tempEventName);

    setTempEventName("");
    setEventFromLocationId("");
    setEventToLocationId("");
  };

  const searchEventByCategory = (e) => {
    e.preventDefault();
    setEventFromLocationId(tempEventFromLocationId);
    setEventToLocationId(tempEventToLocationId);
    setTempEventFromLocationId("");
    setTempEventToLocationId("");
    setEventName("");
  };

  return (
    <div className="container-fluid mb-2">
      <FloatingBubbles count={6} height={260} />
      <Carousel />
      {/* Info links: About / Contact / Careers */}
      <section className="info-section container mt-4 mb-4">
        <div className="row g-3">
          <div className="col-md-4">
            <a href="#about" className="text-decoration-none">
              <div className="card info-card p-3 h-100">
                <h5>About Us</h5>
                <p className="mb-0">Learn who we are and what we do — our mission is to make travel simple and memorable.</p>
                <div className="mt-auto text-end">
                  <small className="text-muted">Read more →</small>
                </div>
              </div>
            </a>
          </div>

          <div className="col-md-4">
            <a href="#contact" className="text-decoration-none">
              <div className="card info-card p-3 h-100">
                <h5>Contact Us</h5>
                <p className="mb-0">Have a question or need help planning? Reach out to our support team anytime.</p>
                <div className="mt-auto text-end">
                  <small className="text-muted">Get in touch →</small>
                </div>
              </div>
            </a>
          </div>

          <div className="col-md-4">
            <a href="#careers" className="text-decoration-none">
              <div className="card info-card p-3 h-100">
                <h5>Careers</h5>
                <p className="mb-0">Join our growing team — check open roles and benefits of working with us.</p>
                <div className="mt-auto text-end">
                  <small className="text-muted">See openings →</small>
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Anchor detail sections */}
      <div className="container mb-5">
        <section id="about" className="info-details p-4 mb-3 card">
          <h3>About Us</h3>
          <p>
            At Tours & Travels we believe in creating joyful journeys. Founded in 2010, our team
            combines local expertise with modern booking technology to offer curated tours,
            comfortable lodging, and trusted guides. We value safety, sustainability and
            exceptional customer service.
          </p>
        </section>

        <section id="contact" className="info-details p-4 mb-3 card">
          <h3>Contact Us</h3>
          <p>
            Email: support@toursandtravels.example<br />
            Phone: +1 (555) 123-4567<br />
            Office: 123 Travel Lane, Holiday City
          </p>
          <p>Our support team is available Monday–Friday, 9am–6pm.</p>
        </section>

        <section id="careers" className="info-details p-4 mb-5 card">
          <h3>Careers</h3>
          <p>
            We're growing! We regularly hire for engineering, product, customer support, and operations.
            Interested candidates can send a CV to careers@toursandtravels.example — we reply within 2 weeks.
          </p>
        </section>
      </div>
      <h5 className="text-color-second text-center mt-3">
        Search Tours here..!!
      </h5>

      <div className="d-flex aligns-items-center justify-content-center">
        <div className="row">
          <div className="col-auto">
            <div className="mt-3">
              <form class="row g-3" onSubmit={searchEventByName}>
                <div class="col-auto">
                  <input
                    type="text"
                    className="form-control"
                    id="city"
                    name="eventName"
                    list="tour-suggestions"
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    onChange={(e) => setTempEventName(e.target.value)}
                    value={tempEventName}
                    placeholder="Search Tour here..."
                  />

                  <datalist id="tour-suggestions">
                    {[
                      'Kathmandu Trek',
                      'Pokhara Lakeside',
                      'Chitwan Safari',
                      'Annapurna Circuit',
                      'Beach Escape',
                      'Family Package'
                    ].map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>

                  {showSuggestions && (
                    <div className="suggestion-box mt-2 p-2 card">
                      <small className="text-muted">Try a sample search:</small>
                      <div className="mt-2">
                        {['Kathmandu Trek','Beach Escape','Family Package','Chitwan Safari'].map((s) => (
                          <button
                            key={s}
                            type="button"
                            className="btn btn-sm btn-outline-secondary me-2 mb-2"
                            onMouseDown={() => {
                              // use onMouseDown so click registers before blur hides box
                              setTempEventName(s);
                              setEventName(s);
                            }}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div class="col-auto">
                  <button
                    type="submit"
                    class="btn bg-color custom-bg-text mb-3"
                  >
                    Search
                  </button>
                </div>
              </form>
            </div>
          </div>
          <div className="col">
            <div className="mt-3">
              <form class="row g-3">
                <div class="col-auto">
                  <input
                    type="text"
                    className="form-control"
                    name="tempEventFromLocationName"
                    list="from-locations"
                    value={tempEventFromLocationName}
                    placeholder="From Tour Location (e.g. Kathmandu)"
                    onChange={(e) => {
                      const v = e.target.value;
                      setTempEventFromLocationName(v);
                      const match = locations.find(
                        (l) => l.name && l.name.toLowerCase() === v.toLowerCase()
                      );
                      setTempEventFromLocationId(match ? match.id : "");
                    }}
                  />
                  <datalist id="from-locations">
                    {locations.map((location) => (
                      <option key={location.id} value={location.name} />
                    ))}
                  </datalist>
                </div>

                <div class="col-auto">
                  <input
                    type="text"
                    className="form-control"
                    name="tempEventToLocationName"
                    list="to-locations"
                    value={tempEventToLocationName}
                    placeholder="To Tour Location (e.g. Pokhara)"
                    onChange={(e) => {
                      const v = e.target.value;
                      setTempEventToLocationName(v);
                      const match = locations.find(
                        (l) => l.name && l.name.toLowerCase() === v.toLowerCase()
                      );
                      setTempEventToLocationId(match ? match.id : "");
                    }}
                  />
                  <datalist id="to-locations">
                    {locations.map((location) => (
                      <option key={location.id} value={location.name} />
                    ))}
                  </datalist>
                </div>

                <div class="col-auto">
                  <button
                    type="submit"
                    class="btn bg-color custom-bg-text mb-3"
                    onClick={searchEventByCategory}
                  >
                    Search
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="col-md-12 mt-3 mb-5">
        <div className="row row-cols-1 row-cols-md-2 g-4">
          {tours.map((tour) => {
            return <TourCard item={tour} key={tour.id} />;
          })}
        </div>
      </div>
      <hr />
      <Footer />
    </div>
  );
};

export default HomePage;
