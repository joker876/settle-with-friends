import { IUpdateUserPseudonymRequest, IUpdateUserPseudonymResponse } from "@shared/contracts/participants/update-pseudonym";
import { IsNotEmpty, IsString } from "class-validator";
import { TrimString } from "../../../utils/trim-string.transform";


export class UpdateUserPseudonymRequestDto implements IUpdateUserPseudonymRequest {
  @IsNotEmpty()
  @IsString()
  @TrimString()
  pseudonym: string;
}

export class UpdateUserPseudonymResponseDto implements IUpdateUserPseudonymResponse {
  pseudonym: string;
}