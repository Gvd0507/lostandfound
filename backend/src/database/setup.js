const db = require('./db');

const setupDatabase = async () => {
  console.log('Setting up database...');

  try {
    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        firebase_uid VARCHAR(255) UNIQUE NOT NULL,
        display_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Users table created');

    // Create lost_items table
    await db.query(`
      CREATE TABLE IF NOT EXISTS lost_items (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        item_name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        location VARCHAR(255) NOT NULL,
        date_lost DATE NOT NULL,
        image_url TEXT,
        image_features TEXT,
        secret_question TEXT NOT NULL,
        secret_answer_hash TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Lost items table created');

    // Create found_items table
    await db.query(`
      CREATE TABLE IF NOT EXISTS found_items (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        item_name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        location VARCHAR(255) NOT NULL,
        date_found DATE NOT NULL,
        image_url TEXT,
        image_features TEXT,
        secret_detail TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Found items table created');

    // Create matches table
    await db.query(`
      CREATE TABLE IF NOT EXISTS matches (
        id SERIAL PRIMARY KEY,
        lost_item_id INTEGER REFERENCES lost_items(id) ON DELETE CASCADE,
        found_item_id INTEGER REFERENCES found_items(id) ON DELETE CASCADE,
        match_score DECIMAL(5, 4) NOT NULL,
        image_similarity DECIMAL(5, 4),
        text_similarity DECIMAL(5, 4),
        status VARCHAR(50) DEFAULT 'matched',
        verification_attempts INTEGER DEFAULT 0,
        verified_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Matches table created');

    // Create admin_cases table
    await db.query(`
      CREATE TABLE IF NOT EXISTS admin_cases (
        id SERIAL PRIMARY KEY,
        match_id INTEGER REFERENCES matches(id) ON DELETE CASCADE,
        reason TEXT NOT NULL,
        resolution TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        resolved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Admin cases table created');

    // Create notifications table
    await db.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        match_id INTEGER REFERENCES matches(id) ON DELETE CASCADE,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Notifications table created');

    // Create indexes
    await db.query('CREATE INDEX IF NOT EXISTS idx_lost_items_user_id ON lost_items(user_id);');
    await db.query('CREATE INDEX IF NOT EXISTS idx_lost_items_status ON lost_items(status);');
    await db.query('CREATE INDEX IF NOT EXISTS idx_lost_items_category ON lost_items(category);');
    await db.query('CREATE INDEX IF NOT EXISTS idx_found_items_user_id ON found_items(user_id);');
    await db.query('CREATE INDEX IF NOT EXISTS idx_found_items_status ON found_items(status);');
    await db.query('CREATE INDEX IF NOT EXISTS idx_found_items_category ON found_items(category);');
    await db.query('CREATE INDEX IF NOT EXISTS idx_matches_lost_item_id ON matches(lost_item_id);');
    await db.query('CREATE INDEX IF NOT EXISTS idx_matches_found_item_id ON matches(found_item_id);');
    console.log('✓ Indexes created');

    console.log('Database setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
};

setupDatabase();
