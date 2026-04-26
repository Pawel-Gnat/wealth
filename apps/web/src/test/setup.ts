import '@testing-library/jest-dom'
import './msw-setup'

import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
	cleanup()
})
