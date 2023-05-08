import { Alert, Avatar, Box, Button, Grid, Link, Paper, Stack, Typography } from '@mui/material'
import { format } from 'date-fns'
import Image from 'next/image'
import { useRef } from 'react'
import { z } from 'zod'
import { useLogoUrl } from '../../helpers/hooks'
import { UsersQuery, namedOperations, useUpdateUserParentalApprovalMutation, useUsersQuery } from '../../schema'
import { captureElementToBlob } from '../../utils/capture'
import { useAlert } from '../../utils/context/alert'
import { useUser } from '../../utils/context/auth'
import { useUpload } from '../../utils/upload'
import { NextLink } from '../common/NextLink'
import { Form } from '../common/form/Form'
import { FormCheckbox } from '../common/form/FormCheckbox'
import { FormSignature } from '../common/form/FormSignature'
import { FormText } from '../common/form/FormText'

const schema = z.object({
  agree: z.boolean().refine((e) => e === true, 'Please agree to Parental Consent'),
  name: z.string().min(4),
  date: z.string(),
  signature: z.string().min(1),
})

function ConsentModal({
  name,
  onSubmit,
  childUser,
}: {
  name: string
  onSubmit: () => void
  childUser: UsersQuery['users']['nodes'][0]
}) {
  const ref = useRef<HTMLElement>(null)

  const { upload } = useUpload()
  const logoUrl = useLogoUrl()

  const [consent] = useUpdateUserParentalApprovalMutation({
    refetchQueries: [namedOperations.Query.users],
  })

  return (
    <Form
      schema={schema}
      defaultValues={{
        name,
        agree: false,
        signature: '',
        date: format(new Date(), 'MMMM d, yyyy'),
      }}
      onSubmit={async () => {
        if (!ref.current) return

        const blob = await captureElementToBlob(ref.current)
        const signatureUploadId = await upload(blob)

        await consent({
          variables: {
            approve: true,
            id: childUser.id,
            signatureUploadId,
          },
        })

        onSubmit()
      }}
    >
      <Stack>
        <Image alt="Logo" src={logoUrl} width={162} height={75} />
        <Box>
          <Typography variant="h5">Parental Consent</Typography>
          <Typography>for {childUser.name}</Typography>
        </Box>
        <FormCheckbox
          name="agree"
          label={
            <Typography>
              I agree to{' '}
              <NextLink href="/parental-consent">
                <Link target="_blank">Parental Consent</Link>
              </NextLink>
              .
            </Typography>
          }
        />
        <FormText name="name" label="Name" required />
        <FormText name="date" label="Date" required disabled />
        <FormText name="signature" label="Signature" required />
        <FormSignature name="signature" ref={ref} />
      </Stack>
    </Form>
  )
}

function ConsentAction({ user: childUser }: { user: UsersQuery['users']['nodes'][0] }) {
  const { user } = useUser()
  const { pushAlert } = useAlert()

  return (
    <>
      <Button
        variant="text"
        color="inherit"
        size="small"
        onClick={() => {
          pushAlert({
            title: '',
            type: 'custom',
            content: ConsentModal,
            props: { name: user.name, childUser },
          })
        }}
      >
        Consent
      </Button>
    </>
  )
}

function ChildCard({ user }: { user: UsersQuery['users']['nodes'][0] }) {
  return (
    <Paper sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center">
        <Avatar src={user.avatar?.url} />
        <Box flexGrow={1}>
          <Typography fontWeight="bold">{user.name}</Typography>
          <Typography>{user.email}</Typography>
        </Box>
      </Stack>
      <Alert
        sx={{ mt: 2 }}
        severity={user.parentalApproval ? 'success' : 'error'}
        action={!user.parentalApproval && <ConsentAction user={user} />}
      >
        {user.parentalApproval ? 'Parental Approved' : 'Needs Parental Consent'}
      </Alert>
    </Paper>
  )
}

export function ParentChildrenTable() {
  const { user } = useUser()

  const query = useUsersQuery({
    variables: {
      page: { size: 50 },
      filter: {
        from: 'PARENT',
        fromId: user.id,
      },
    },
  })

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h5">Children</Typography>
        </Grid>
        {query.data?.users.nodes.map((user) => (
          <Grid key={user.id} item xs={12} sm={6} md={4}>
            <ChildCard user={user} />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}