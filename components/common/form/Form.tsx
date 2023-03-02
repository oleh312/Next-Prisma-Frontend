import { zodResolver } from '@hookform/resolvers/zod'
import { LoadingButton } from '@mui/lab'
import { Stack } from '@mui/material'
import { useCallback, useState } from 'react'
import { DeepPartial, FieldValues, FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'

type FormProps<T> = {
  schema: z.Schema<T>
  children: React.ReactNode
  submit?: string
  onSubmit: (data: T, dirty: Partial<T>) => void | Promise<void>
  defaultValues?: Partial<T>
}

export function Form<T extends {}>(props: FormProps<T>) {
  const methods = useForm({
    resolver: zodResolver(props.schema),
    defaultValues: props.defaultValues as DeepPartial<T>,
  })

  const [loading, setLoading] = useState(false)

  const onSubmit = useCallback(
    async (data: FieldValues) => {
      const { dirtyFields } = methods.formState

      const dirty = Object.keys(data)
        .filter((key) => (dirtyFields as any)[key] === true)
        .reduce((dict: Record<string, any>, key) => {
          dict[key] = (data as any)[key]
          return dict
        }, {})

      try {
        setLoading(true)
        await props.onSubmit(data as T, dirty as Partial<T>)
      } finally {
        setLoading(false)
      }
    },
    [methods.formState, props]
  )

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <Stack>
          {props.children}
          <LoadingButton loading={loading} type="submit">
            {props.submit ?? 'Submit'}
          </LoadingButton>
        </Stack>
      </form>
    </FormProvider>
  )
}
