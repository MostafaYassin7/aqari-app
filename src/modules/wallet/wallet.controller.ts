import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { User } from '../users/entities/user.entity';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import { TopUpDto } from './dto/top-up.dto';
import { WalletService } from './wallet.service';

@ApiTags('Wallet')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @ApiOperation({ summary: 'Get wallet balance' })
  getBalance(@GetUser() user: User) {
    return this.walletService.getBalance(user.id);
  }

  @Post('top-up')
  @ApiOperation({ summary: 'Top up wallet balance' })
  topUp(@GetUser() user: User, @Body() dto: TopUpDto) {
    return this.walletService.topUp(
      user.id,
      dto.amount,
      dto.paymentMethod ?? 'manual',
    );
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get paginated wallet transactions' })
  getTransactions(@GetUser() user: User, @Query() query: QueryTransactionsDto) {
    return this.walletService.getTransactions(
      user.id,
      query.referenceType,
      query.page,
      query.limit,
    );
  }

  @Get('invoices')
  @ApiOperation({ summary: 'Get paginated invoices' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getInvoices(
    @GetUser() user: User,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.walletService.getInvoices(
      user.id,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }
}
