// This is a temporary script to seed the database with initial data.
// It reads the local JSON files and uploads them to Supabase.

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import { supabase } from './src/supabaseClient.js';
const clients = require('./src/db/clients.json');
const drivers = require('./src/db/drivers.json');
const fleet = require('./src/db/fleet.json');
const orders = require('./src/db/orders.json');

const seedDatabase = async () => {
  console.log('Starting to seed database...');

  // 1. Seed Clients
  const { error: clientError } = await supabase.from('clients').insert(clients);
  if (clientError) {
    console.error('Error seeding clients:', clientError.message);
  } else {
    console.log(`Successfully seeded clients.`);
  }

  // 2. Seed Drivers
  const { error: driverError } = await supabase.from('drivers').insert(drivers);
  if (driverError) {
    console.error('Error seeding drivers:', driverError.message);
  } else {
    console.log(`Successfully seeded drivers.`);
  }

  // 3. Seed Trucks from fleet.json
  const { error: truckError } = await supabase.from('trucks').insert(fleet.trucks);
  if (truckError) {
    console.error('Error seeding trucks:', truckError.message);
  } else {
    console.log(`Successfully seeded trucks.`);
  }

  // 4. Seed Trailers from fleet.json
  const { error: trailerError } = await supabase.from('trailers').insert(fleet.trailers);
  if (trailerError) {
    console.error('Error seeding trailers:', trailerError.message);
  } else {
    console.log(`Successfully seeded trailers.`);
  }

  // 5. Seed Orders
  const { error: orderError } = await supabase.from('orders').insert(orders);
  if (orderError) {
    console.error('Error seeding orders:', orderError.message);
  } else {
    console.log(`Successfully seeded orders.`);
  }

  console.log('Database seeding finished.');
};

seedDatabase();
