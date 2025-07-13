import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { FcGoogle } from "react-icons/fc"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useRouter } from 'next/navigation'

const Authenticate = () => {
  const supabase = useSupabaseClient()
  const { toast } = useToast()
  const router = useRouter()
  
  const signInWithGoogle = async () => {
    console.log('Starting Google sign in...');
    
    try {
      const { error, data } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
              redirectTo: `${window.location.origin}/app`
          },
      })

      console.log('Sign in response:', { error, data });

      if (error) {
          console.error('Sign in error:', error);
          toast({
              title: "🔴 Something went wrong",
              description: error.message || "Please try again.",
          })
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
          title: "🔴 Unexpected error",
          description: "Please check the console for details.",
      })
    }
  }

  return (
    <AlertDialog defaultOpen>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Authenticate with Google</AlertDialogTitle>
          <AlertDialogDescription>To continue, please sign in with your Google account.</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-4 py-4">
            <Button variant="outline" className="w-full gap-2" onClick={() => signInWithGoogle()}>
            <FcGoogle />
            Sign in with Google
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default Authenticate
