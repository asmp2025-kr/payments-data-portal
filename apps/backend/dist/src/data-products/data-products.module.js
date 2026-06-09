"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataProductsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const data_products_controller_1 = require("./data-products.controller");
const data_products_service_1 = require("./data-products.service");
let DataProductsModule = class DataProductsModule {
};
exports.DataProductsModule = DataProductsModule;
exports.DataProductsModule = DataProductsModule = __decorate([
    (0, common_1.Module)({ imports: [typeorm_1.TypeOrmModule.forFeature([])], controllers: [data_products_controller_1.DataProductsController], providers: [data_products_service_1.DataProductsService], exports: [data_products_service_1.DataProductsService] })
], DataProductsModule);
//# sourceMappingURL=data-products.module.js.map