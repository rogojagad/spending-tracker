import limitSnapshotRepository, {
  ILimitSnapshotWithCategoryNameAndSourceName,
} from "./repository.ts";

const getAllWithCategoryNameAndSourceName = async (): Promise<
  ILimitSnapshotWithCategoryNameAndSourceName[]
> => {
  return await limitSnapshotRepository.getAllWithCategoryNameAndSourceName();
};

const limitSnapshotService = {
  getAllWithCategoryNameAndSourceName,
};

export default limitSnapshotService;
