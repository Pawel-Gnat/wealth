import { All, Controller, Req, Res } from '@nestjs/common'
import type { Request, Response } from 'express'
import { AuthService } from 'src/auth/auth.service'
import { ORPC_HTTP_PREFIX } from './constants'
import type { OrpcAppContext } from './context/orpc-app-context'
import { OrpcService } from './orpc.service'

@Controller(ORPC_HTTP_PREFIX)
export class OrpcController {
	constructor(
		private readonly orpc: OrpcService,
		private readonly authService: AuthService,
	) {}

	@All()
	async handleBase(@Req() req: Request, @Res() res: Response): Promise<void> {
		await this.dispatch(req, res)
	}

	@All('*')
	async handleNested(@Req() req: Request, @Res() res: Response): Promise<void> {
		await this.dispatch(req, res)
	}

	private async dispatch(req: Request, res: Response): Promise<void> {
		const context: OrpcAppContext = { auth: this.authService }
		const { matched } = await this.orpc.handler.handle(req, res, {
			prefix: ORPC_HTTP_PREFIX,
			context,
		})
		if (!matched) {
			res.status(404).send('Not found')
		}
	}
}
