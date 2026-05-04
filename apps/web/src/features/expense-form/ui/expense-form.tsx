import { Form, FormDatePicker } from '@/shared/components'
import { zodResolver } from '@hookform/resolvers/zod'
import { documentCreatePayloadSchema, type DocumentCreatePayload } from '@repo/api/schemas'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

export const ExpenseForm = () => {
	const { t } = useTranslation()
	// const { signIn, isLoading } = useSignIn({
	// 	onSuccess: data => {
	// 		storeToken(data.data.token)
	// 	},
	// 	onError: () => {
	// 		toast.error(t('toast.error.signed_in', { ns: 'common' }))
	// 	},
	// })

	const form = useForm<DocumentCreatePayload>({
		resolver: zodResolver(documentCreatePayloadSchema),
		defaultValues: {
			date: new Date(),
			lineItems: [],
		},
	})

	function onSubmit(data: DocumentCreatePayload) {
		console.log(data)
	}

	return (
		<Form
			onSubmit={form.handleSubmit(onSubmit)}
			submitText={t('common.create', { ns: 'common' })}
			submitDisabled={false}
			isLoading={false}>
			{/* <FormInput
				name='email'
				label={t('email.label', { ns: 'form' })}
				type='email'
				placeholder={t('email.placeholder', { ns: 'form' })}
				control={form.control}
			/> */}

			<FormDatePicker
				name='date'
				label={t('date.label', { ns: 'form' })}
				control={form.control}
			/>
		</Form>
	)
}
