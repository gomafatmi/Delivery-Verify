CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role VARCHAR(20) NOT NULL CHECK (role IN ('amazon_admin', 'delivery_person', 'customer')),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amazon_order_id VARCHAR(100) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES users(id),
    delivery_person_id UUID REFERENCES users(id),
    product_description TEXT,
    product_value DECIMAL(10,2) NOT NULL,
    delivery_address TEXT NOT NULL,
    delivery_lat DECIMAL(10,7),
    delivery_lng DECIMAL(10,7),
    otp_code VARCHAR(10),
    otp_generated_at TIMESTAMPTZ,
    status VARCHAR(30) DEFAULT 'pending' CHECK (
        status IN ('pending','assigned','in_transit','arrived','verified','completed','failed','disputed')
    ),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE verification_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_id UUID NOT NULL REFERENCES deliveries(id),
    status VARCHAR(30) DEFAULT 'in_progress' CHECK (status IN ('in_progress','passed','failed')),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE verification_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES verification_sessions(id),
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
        'arrival','gps_check','photo_customer','photo_delivery',
        'otp_entry','signature_customer','signature_delivery',
        'confirmation','package_check','ai_vision_check','privacy_check'
    )),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','success','failed')),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES verification_events(id),
    type VARCHAR(30) NOT NULL CHECK (type IN ('photo','signature','screenshot')),
    file_path VARCHAR(500) NOT NULL,
    file_hash VARCHAR(64) NOT NULL,
    gps_lat DECIMAL(10,7),
    gps_lng DECIMAL(10,7),
    captured_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level VARCHAR(10) NOT NULL CHECK (level IN ('ERROR','WARN','INFO','DEBUG')),
    action VARCHAR(100) NOT NULL,
    actor_id UUID REFERENCES users(id),
    delivery_id UUID REFERENCES deliveries(id),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_deliveries_amazon_order ON deliveries(amazon_order_id);
CREATE INDEX idx_verification_sessions_delivery ON verification_sessions(delivery_id);
CREATE INDEX idx_verification_events_session ON verification_events(session_id);
CREATE INDEX idx_evidence_event ON evidence(event_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_level ON audit_logs(level);
