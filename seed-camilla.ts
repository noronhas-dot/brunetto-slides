import { drizzle } from "drizzle-orm/mysql2";
import { credentials, organizations } from "./drizzle/schema";
import * as crypto from "crypto";

// Simple password hashing (use bcrypt in production)
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function seed() {
  const db = drizzle(process.env.DATABASE_URL!);
  
  // Create Brunetto organization
  const orgId = "org_brunetto_" + Date.now();
  await db.insert(organizations).values({
    id: orgId,
    name: "Brunetto & CO",
    subdomain: "brunetto",
    logoUrl: null,
    primaryColor: "#1A3123",
    secondaryColor: "#8B9B88",
    accentColor: "#F9EAD3",
  });
  
  console.log("✅ Organization created:", orgId);
  
  // Create Camilla's credentials
  const credId = "cred_camilla_" + Date.now();
  await db.insert(credentials).values({
    id: credId,
    organizationId: orgId,
    username: "camillabrunetto",
    passwordHash: hashPassword("17283911101991"),
    name: "Camilla Brunetto",
    email: "camilla@brunetto.com",
    role: "owner",
  });
  
  console.log("✅ Credentials created for camillabrunetto");
  console.log("✅ Login: camillabrunetto");
  console.log("✅ Password: 17283911101991");
  
  process.exit(0);
}

seed().catch(console.error);
