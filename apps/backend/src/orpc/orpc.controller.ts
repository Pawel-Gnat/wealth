import { All, Controller, Req, Res } from '@nestjs/common'
import type { Request, Response } from 'express'
import { OrpcService } from './orpc.service'
import { ORPC_HTTP_PREFIX } from './constants'

@Controller(ORPC_HTTP_PREFIX)
export class OrpcController {
	constructor(private readonly orpc: OrpcService) {}

	@All()
	async handleBase(@Req() req: Request, @Res() res: Response): Promise<void> {
		await this.dispatch(req, res)
	}

	@All('*')
	async handleNested(@Req() req: Request, @Res() res: Response): Promise<void> {
		await this.dispatch(req, res)
	}

	private async dispatch(req: Request, res: Response): Promise<void> {
		const { matched } = await this.orpc.handler.handle(req, res, {
			prefix: ORPC_HTTP_PREFIX,
			context: {},
		})
		if (!matched) {
			res.status(404).send('Not found')
		}
	}
}
