import { useNavigate } from 'react-router-dom'

interface PageHeaderProps {
  title: string
  back?: boolean
  right?: React.ReactNode
}

export function PageHeader({ title, back = false, right }: PageHeaderProps) {
  const navigate = useNavigate()
  return (
    <div className="flex items-center justify-between px-4 pt-4 pb-2">
      {back ? (
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl bg-card2 flex items-center justify-center text-lg"
        >
          ←
        </button>
      ) : (
        <div className="w-9" />
      )}
      <h1 className="font-display font-bold text-lg">{title}</h1>
      <div className="w-9 flex justify-end">{right}</div>
    </div>
  )
}
