import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
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
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';

@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @ApiOperation({ summary: 'Find or create a chat with another user' })
  createChat(@GetUser() user: User, @Body() dto: CreateChatDto) {
    return this.chatService.findOrCreateChat(
      user.id,
      dto.participantId,
      dto.listingId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all chats for the current user' })
  getUserChats(@GetUser() user: User) {
    return this.chatService.getUserChats(user.id);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Get paginated messages for a chat' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getChatMessages(
    @GetUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.chatService.getChatMessages(
      id,
      user.id,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a chat for the current user' })
  deleteChat(@GetUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.chatService.deleteChat(id, user.id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark all messages in a chat as read' })
  markRead(@GetUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.chatService.markMessagesRead(id, user.id);
  }
}
