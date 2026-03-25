import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { User } from '../users/entities/user.entity';
import { PurchasePromotionDto } from './dto/purchase-promotion.dto';
import { PromotionsService } from './promotions.service';

@ApiTags('Promotions')
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Public()
  @Get('types')
  @ApiOperation({ summary: 'Get all active promotion types' })
  getTypes() {
    return this.promotionsService.getActiveTypes();
  }

  @UseGuards(JwtGuard)
  @Get('my')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my promotions' })
  getMyPromotions(@GetUser() user: User) {
    return this.promotionsService.getMyPromotions(user.id);
  }

  @UseGuards(JwtGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Purchase a promotion for a listing' })
  purchase(@GetUser() user: User, @Body() dto: PurchasePromotionDto) {
    return this.promotionsService.purchasePromotion(user.id, dto.listingId, dto.promotionTypeId);
  }

  @UseGuards(JwtGuard)
  @Patch(':id/cancel')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel an active promotion' })
  cancel(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this.promotionsService.cancelPromotion(id, user.id);
  }
}
