interface PageHeaderProps {
  title: string
  description?: string
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-8 text-center sm:mb-12">
      <h1 className="mb-3 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-3xl font-bold text-transparent sm:mb-4 sm:text-4xl">
        {title}
      </h1>
      {description && <p className="text-base text-white/90 sm:text-lg">{description}</p>}
    </div>
  )
}
