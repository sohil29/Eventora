const Event = require('../models/Event');

exports.getAllEvents = async (req, res) => {
    try {

        const filters = {};
        if (req.query.category) {
            filters.category = req.query.category;
        }
        if (req.query.ticketprice) {
            filters.ticketPrice = req.query.ticketprice;
        }

        const events = await Event.find(filters);

        const formattedEvents = events.map(event => ({
            ...event.toObject(),
            imageUrl: event.imageUrl || event.image || ''
        }));

        res.status(200).json(formattedEvents);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }
        res.json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createEvent = async (req, res) => {
    const { title, description, date, location, category, ticketPrice } = req.body;
    const totalseats = req.body.totalseats ?? req.body.totalSeats;
    const imageUrl = req.body.imageUrl ?? req.body.image;

    try {
        const event = await Event.create({
            title,
            description,
            date,
            location,
            category,
            totalseats,
            availableSeats: totalseats,
            ticketPrice,
            imageUrl,
            createdBy: req.user._id
        });

        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateEvent = async (req, res) => {
    const { title, description, date, location, category, availableSeats, ticketPrice } = req.body;
    const totalseats = req.body.totalseats ?? req.body.totalSeats;
    const imageUrl = req.body.imageUrl ?? req.body.image;

    try {
        const event = await Event.findByIdAndUpdate(req.params.id, {
            title,
            description,
            date,
            location,
            category,
            totalseats,
            availableSeats,
            ticketPrice,
            imageUrl
        }, { new: true });

        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }

        res.json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);

        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }

        res.json({ message: "Event deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};