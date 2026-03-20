import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createExercise } from './actions';
import SuccessBanner from './SuccessBanner';

export default async function ExerciseNewPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const { success: successParam } = await searchParams;
  const success = successParam === '1';

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="flex w-full max-w-md flex-col gap-4">
      <Card className="w-full">
        <CardHeader>
          <Image
            src="/workout.svg"
            alt="Man working out"
            width={352}
            height={352}
            className="w-2/5 mx-auto"
            priority
          />
          <CardTitle>New Exercise</CardTitle>
          <CardDescription>Add a new exercise to the database.</CardDescription>
        </CardHeader>

        <form action={createExercise}>
          <CardContent className="flex flex-col gap-4">
            {success && <SuccessBanner />}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g. Bench Press"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                name="category"
                placeholder="e.g. Chest, Legs, Cardio"
              />
            </div>
          </CardContent>

          <CardFooter className="justify-end">
            <Button type="submit">Create Exercise</Button>
          </CardFooter>
        </form>
      </Card>
      </div>
    </main>
  );
}
