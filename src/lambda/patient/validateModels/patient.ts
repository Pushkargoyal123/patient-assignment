import { ArrayMinSize, IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePatient {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    address: string;

    @IsArray()
    @IsNotEmpty()
    @IsString({ each: true })
    conditions: string[];

    @IsArray()
    @IsNotEmpty()
    @IsString({ each: true })
    @ArrayMinSize(1)
    allergies: string[];
}

export class UpdatePatient {
    @IsOptional()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    address: string;

    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    @ArrayMinSize(1)
    conditions: string[];

    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    @ArrayMinSize(1)
    allergies: string[];
}
