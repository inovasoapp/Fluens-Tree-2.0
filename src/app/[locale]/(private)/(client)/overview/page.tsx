export default function ClientOverview() {
  return (
    <section className="flex flex-col w-full px-4 md:px-6 pt-1">
      <h1 className="text-3xl text-zinc-600 dark:text-zinc-50 ml-10 md:ml-0">
        Inicio
      </h1>

      <div className="flex items-center justify-between mt-6 md:mt-10">
        <div>
          <h1 className="text-3xl text-zinc-600 dark:text-zinc-50 font-semibold">
            👋 Bom dia, <strong>Rodolfo</strong>!
          </h1>
          <p className="text-muted-foreground">
            Pronto para converter mais hoje?
          </p>
        </div>
      </div>
    </section>
  );
}
