import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { HotelService } from './server/services/HotelService';
import { FileStorageService } from './server/services/FileStorage';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Log API requests for debugging / OOP Inspector
  app.use('/api', (req, res, next) => {
    console.log(`[API ${req.method}] ${req.url}`);
    next();
  });

  // REST API Endpoints

  // 1. Hotel Information
  app.get('/api/hotel', async (req, res) => {
    try {
      const hotel = await HotelService.getHotelInfo();
      res.json(hotel);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 2. Search & Filter Rooms (with availability check)
  app.get('/api/rooms', async (req, res) => {
    try {
      const {
        keyword,
        checkIn,
        checkOut,
        guests,
        category,
        minPrice,
        maxPrice,
        amenities,
        sortBy,
      } = req.query;

      let amenitiesList: string[] = [];
      if (typeof amenities === 'string') {
        amenitiesList = amenities.split(',').map((s) => s.trim()).filter(Boolean);
      } else if (Array.isArray(amenities)) {
        amenitiesList = amenities.map((s) => String(s).trim()).filter(Boolean);
      }

      const rooms = await HotelService.searchRooms({
        keyword: keyword as string,
        checkIn: checkIn as string,
        checkOut: checkOut as string,
        guests: guests ? Number(guests) : undefined,
        category: category as any,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        amenities: amenitiesList,
        sortBy: sortBy as any,
      });

      res.json(rooms);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 3. Get Single Room
  app.get('/api/rooms/:id', async (req, res) => {
    try {
      const room = await HotelService.getRoomById(req.params.id);
      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }
      res.json(room);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 4. Create Reservation & Payment Simulation
  app.post('/api/reservations', async (req, res) => {
    try {
      const { roomId, checkInDate, checkOutDate, guestsCount, guest, paymentMethod, cardDetails, selectedAddons } = req.body;

      if (!roomId || !checkInDate || !checkOutDate || !guest || !paymentMethod) {
        return res.status(400).json({ error: 'Missing required booking parameters.' });
      }

      const result = await HotelService.createReservation({
        roomId,
        checkInDate,
        checkOutDate,
        guestsCount: Number(guestsCount) || 1,
        guest,
        paymentMethod,
        cardDetails,
        selectedAddons,
      });

      res.status(201).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // 5. Get Reservations (Search by confirmation code or email)
  app.get('/api/reservations', async (req, res) => {
    try {
      const { code, email } = req.query;
      const reservations = await HotelService.getReservations(code as string, email as string);
      res.json(reservations);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 6. Cancel Reservation
  app.post('/api/reservations/:id/cancel', async (req, res) => {
    try {
      const result = await HotelService.cancelReservation(req.params.id);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Delete / Remove Reservation
  app.delete('/api/reservations/:id', async (req, res) => {
    try {
      const result = await HotelService.deleteReservation(req.params.id);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // 7. Admin Dashboard Stats
  app.get('/api/admin/stats', async (req, res) => {
    try {
      const stats = await HotelService.getAdminStats();
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 8. Admin Add or Edit Room
  app.post('/api/admin/rooms', async (req, res) => {
    try {
      const saved = await HotelService.saveRoom(req.body);
      res.json(saved);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Admin Delete / Remove Room
  app.delete('/api/admin/rooms/:id', async (req, res) => {
    try {
      const result = await HotelService.deleteRoom(req.params.id);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // 9. Inspector API - Inspect raw JSON File I/O stores
  app.get('/api/inspector/db', async (req, res) => {
    try {
      const rooms = await FileStorageService.readData('rooms.json', []);
      const reservations = await FileStorageService.readData('reservations.json', []);
      const payments = await FileStorageService.readData('payments.json', []);
      const hotels = await FileStorageService.readData('hotels.json', []);

      res.json({
        files: {
          'data/rooms.json': rooms,
          'data/reservations.json': reservations,
          'data/payments.json': payments,
          'data/hotels.json': hotels,
        },
        oopClasses: ['Room', 'Reservation', 'Payment', 'HotelService', 'FileStorageService'],
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Hotel System Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
