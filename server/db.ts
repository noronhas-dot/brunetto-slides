import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertOrganization,
  InsertSlide,
  InsertTemplate,
  InsertUser,
  organizations,
  slides,
  templateSlides,
  templates,
  users,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      id: user.id,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = 'admin';
        values.role = 'admin';
        updateSet.role = 'admin';
      }
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.

// ============================================
// ORGANIZATIONS
// ============================================

export async function getOrganizationBySubdomain(subdomain: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(organizations).where(eq(organizations.subdomain, subdomain)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrganizationById(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(organizations).where(eq(organizations.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createOrganization(org: InsertOrganization) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(organizations).values(org);
  return getOrganizationById(org.id);
}

// ============================================
// TEMPLATES
// ============================================

export async function getTemplatesByOrganization(organizationId: string) {
  const db = await getDb();
  if (!db) return [];
  // PERFORMANCE: Consider adding Redis/in-memory caching for frequently accessed templates
  // Cache key: `templates:${organizationId}`, TTL: 5-10 minutes
  return db.select().from(templates).where(eq(templates.organizationId, organizationId)).orderBy(templates.createdAt);
}

export async function getTemplateById(id: string, organizationId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(templates)
    .where(and(eq(templates.id, id), eq(templates.organizationId, organizationId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createTemplate(template: InsertTemplate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(templates).values(template);
  return getTemplateById(template.id, template.organizationId);
}

export async function updateTemplate(id: string, organizationId: string, data: Partial<InsertTemplate>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(templates)
    .set(data)
    .where(and(eq(templates.id, id), eq(templates.organizationId, organizationId)));
  return getTemplateById(id, organizationId);
}

export async function deleteTemplate(id: string, organizationId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(templates).where(and(eq(templates.id, id), eq(templates.organizationId, organizationId)));
}

// ============================================
// SLIDES
// ============================================

export async function getSlidesByOrganization(organizationId: string) {
  const db = await getDb();
  if (!db) return [];
  // PERFORMANCE: Consider adding Redis/in-memory caching for frequently accessed slides
  // Cache key: `slides:${organizationId}`, TTL: 5-10 minutes
  return db.select().from(slides).where(eq(slides.organizationId, organizationId)).orderBy(slides.createdAt);
}

export async function getSlideById(id: string, organizationId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(slides)
    .where(and(eq(slides.id, id), eq(slides.organizationId, organizationId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createSlide(slide: InsertSlide) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(slides).values(slide);
  return getSlideById(slide.id, slide.organizationId);
}

export async function updateSlide(id: string, organizationId: string, data: Partial<InsertSlide>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(slides)
    .set(data)
    .where(and(eq(slides.id, id), eq(slides.organizationId, organizationId)));
  return getSlideById(id, organizationId);
}

export async function deleteSlide(id: string, organizationId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(slides).where(and(eq(slides.id, id), eq(slides.organizationId, organizationId)));
}

// ============================================
// TEMPLATE SLIDES (N:N)
// ============================================

export async function getTemplateSlides(templateId: string, organizationId: string) {
  const db = await getDb();
  if (!db) return [];
  
  // Verify template belongs to organization
  const template = await getTemplateById(templateId, organizationId);
  if (!template) return [];
  
  // PERFORMANCE: This join query benefits from the indexes on templateSlides.templateId and templateSlides.position
  // Get slides with their association data
  const result = await db
    .select({
      slide: slides,
      position: templateSlides.position,
    })
    .from(templateSlides)
    .innerJoin(slides, eq(templateSlides.slideId, slides.id))
    .where(eq(templateSlides.templateId, templateId))
    .orderBy(templateSlides.position);
  
  return result;
}

export async function addSlideToTemplate(templateId: string, slideId: string, organizationId: string, position: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Verify both template and slide belong to organization
  const template = await getTemplateById(templateId, organizationId);
  const slide = await getSlideById(slideId, organizationId);
  if (!template || !slide) throw new Error("Template or slide not found");
  
  const id = `ts_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await db.insert(templateSlides).values({ id, templateId, slideId, position });
}

export async function removeSlideFromTemplate(templateId: string, slideId: string, organizationId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Verify template belongs to organization
  const template = await getTemplateById(templateId, organizationId);
  if (!template) throw new Error("Template not found");
  
  await db.delete(templateSlides)
    .where(and(eq(templateSlides.templateId, templateId), eq(templateSlides.slideId, slideId)));
}

export async function reorderTemplateSlides(templateId: string, organizationId: string, slidePositions: { slideId: string; position: number }[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Verify template belongs to organization
  const template = await getTemplateById(templateId, organizationId);
  if (!template) throw new Error("Template not found");
  
  // Batch update positions using a transaction to avoid N+1 queries
  // This improves performance significantly when reordering multiple slides
  await db.transaction(async (tx) => {
    for (const { slideId, position } of slidePositions) {
      await tx.update(templateSlides)
        .set({ position })
        .where(and(eq(templateSlides.templateId, templateId), eq(templateSlides.slideId, slideId)));
    }
  });
}
