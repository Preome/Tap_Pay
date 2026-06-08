import os
import django
import psycopg2
from decouple import config

# Database connection parameters
DB_NAME = config('DB_NAME', default='neondb')
DB_USER = config('DB_USER', default='neondb_owner')
DB_PASSWORD = config('DB_PASSWORD', default='npg_nISXHx7lvu4Q')
DB_HOST = config('DB_HOST', default='ep-morning-cell-apdw2myw-pooler.c-7.us-east-1.aws.neon.tech')
DB_PORT = config('DB_PORT', default='5432')

def reset_database():
    try:
        # Connect to PostgreSQL
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT,
            sslmode='require'
        )
        conn.autocommit = True
        cursor = conn.cursor()
        
        # Drop all tables
        cursor.execute("""
            DO $$ DECLARE
                r RECORD;
            BEGIN
                FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
                    EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
                END LOOP;
            END $$;
        """)
        
        print("✅ All tables dropped successfully!")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    reset_database()