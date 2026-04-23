import { Module } from '@nestjs/common'
import { AuthModule } from 'src/auth/auth.module'
import { OrpcController } from './orpc.controller'
import { OrpcService } from './orpc.service'

@Module({
	imports: [AuthModule],
	controllers: [OrpcController],
	providers: [OrpcService],
})
export class OrpcModule {}
