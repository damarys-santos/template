function IdRastreavelBadge({ id }: { id: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/30 bg-white/40 px-2 py-0.5 text-xs font-mono font-medium text-foreground/80 backdrop-blur-md dark:border-white/10 dark:bg-white/6">
      #{id}
    </span>
  )
}

export { IdRastreavelBadge }