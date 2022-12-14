import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RoutesService } from './routes.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RoutesGateway } from './routes.gateway';

@Controller('routes')
export class RoutesController {
  constructor(
    private readonly routesService: RoutesService,
    private routeGateway: RoutesGateway,
  ) {}

  @Post()
  create(@Body() createRouteDto: CreateRouteDto) {
    return this.routesService.create(createRouteDto);
  }

  @Get()
  findAll() {
    return this.routesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.routesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRouteDto: UpdateRouteDto) {
    return this.routesService.update(+id, updateRouteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.routesService.remove(+id);
  }

  @MessagePattern('route.new-position')
  consumeNewPosition(
    @Payload()
    message: {
      routeId: string;
      clientId: string;
      position: [number, number];
      finished: boolean;
    },
  ) {
    this.routeGateway.sendPosition(message);
  }
}
