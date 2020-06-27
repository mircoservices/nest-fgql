import { Field, ID, InterfaceType, ObjectType } from '../../../../lib';

@InterfaceType({
  description: 'example interface',
  resolveType: (value) => {
    return Recipe;
  },
})
export abstract class IRecipe {
  @Field((type) => ID)
  id: string;

  @Field()
  title: string;
}

@ObjectType({ implements: IRecipe, description: 'recipe object type' })
export class Recipe {
  @Field((type) => ID)
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  creationDate: Date;

  @Field()
  get averageRating(): number {
    return 0.5;
  }

  @Field({ nullable: true })
  get lastRate(): number | undefined {
    return undefined;
  }

  @Field((type) => [String])
  get tags(): string[] {
    return [];
  }

  constructor(recipe: Partial<Recipe>) {
    Object.assign(this, recipe);
  }
}
