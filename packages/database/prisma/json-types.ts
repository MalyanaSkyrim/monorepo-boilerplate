export {}

declare global {
  // Declare the shapes of your `Json` columns here and reference them from the
  // schema with `/// [TypeName]` (see prisma-json-types-generator).
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace PrismaJson {
    type Metadata = Record<string, string | number | boolean | null>
  }
}
