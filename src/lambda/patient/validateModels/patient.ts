import { ArrayMinSize, IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PatientRecord {
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
