import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material'
import { useRouter } from 'next/router'
import { NextLink } from '../common/NextLink'

type SidebarLinkProps = {
  icon: React.ReactNode
  title: string
  subtitle?: string
  color?: string
} & (
  | {
      href: string
    }
  | {
      onClick: () => void
    }
)

export function SidebarLink(props: SidebarLinkProps) {
  const router = useRouter()
  const isSelected = 'href' in props && router.pathname.startsWith(props.href)

  if ('onClick' in props) {
    return (
      <ListItemButton component="a" selected={isSelected} sx={{ color: props.color }} onClick={props.onClick}>
        <ListItemIcon sx={{ color: 'inherit' }}>{props.icon}</ListItemIcon>
        <ListItemText primary={props.title} secondary={props.subtitle} />
      </ListItemButton>
    )
  }

  return (
    <NextLink href={props.href}>
      <ListItemButton component="a" selected={isSelected} sx={{ color: props.color }}>
        <ListItemIcon sx={{ color: 'inherit' }}>{props.icon}</ListItemIcon>
        <ListItemText primary={props.title} secondary={props.subtitle} />
      </ListItemButton>
    </NextLink>
  )
}
