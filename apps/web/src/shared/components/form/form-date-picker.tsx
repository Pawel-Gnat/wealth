import { format } from 'date-fns'

import { Button } from '@/shared/lib/ui/button'
import { Calendar } from '@/shared/lib/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/lib/ui/popover'

import { FormBase, type FormControlFunction } from './form-base'
import { Icon } from '../icons'

export const FormDatePicker: FormControlFunction = props => {
	return (
		<FormBase {...props}>
			{({ onChange, value, ...field }) => (
				<Popover>
					<PopoverTrigger asChild>
						<Button
							type='button'
							variant='outline'
							className='w-full justify-start text-left font-normal'
							{...field}>
							<Icon name='calendar' />
							{format(value, 'PPP')}
						</Button>
					</PopoverTrigger>
					<PopoverContent
						className='w-auto p-0'
						align='start'>
						<Calendar
							mode='single'
							selected={value}
							onSelect={selected => {
								onChange(selected)
							}}
						/>
					</PopoverContent>
				</Popover>
			)}
		</FormBase>
	)
}
