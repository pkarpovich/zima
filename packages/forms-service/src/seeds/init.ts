import { FormsService } from "../services/forms-service.js";
import { IFormSchema } from "../models/forms-model.js";

export async function initCollectionsIfNeeded({
  formsService,
  formsSeed,
}: {
  formsService: FormsService;
  formsSeed: IFormSchema[];
}) {
  const formsCount = await formsService.getCount();

  if (!formsCount) {
    await formsService.createMany(formsSeed);
  }
}
