export const initCollectionsIfNeeded = async ({ formsService, formsSeed }) => {
  const formsCount = await formsService.getCount();

  if (!formsCount) {
    await formsService.createMany(formsSeed);
  }
};
