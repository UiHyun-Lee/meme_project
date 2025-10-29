from rest_framework import viewsets, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import Evaluation
from .serializers import EvaluationSerializer
from memes.models import Meme

class EvaluationViewSet(viewsets.ModelViewSet):
    queryset = Evaluation.objects.all().order_by('-created_at')
    serializer_class = EvaluationSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        meme_id = request.data.get("meme")
        user_id = request.data.get("user_id")

        if not meme_id:
            return Response({"error": "meme id required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            meme = Meme.objects.get(id=meme_id)
        except Meme.DoesNotExist:
            return Response({"error": "Meme not found"}, status=status.HTTP_404_NOT_FOUND)



        if user_id and Evaluation.objects.filter(meme=meme, user_id=user_id).exists():
            return Response({"error": "Already voted"}, status=status.HTTP_400_BAD_REQUEST)


        # Evaluation speichen
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        evaluation = serializer.save()

        # meme sum update
        all_evals = Evaluation.objects.filter(meme=meme)
        total_votes = all_evals.count()
        avg_humor = sum(e.humor_score for e in all_evals) / total_votes

        #  Meme field update
        meme.humor_avg = avg_humor
        meme.total_votes = total_votes
        meme.save(update_fields=["humor_avg", "total_votes"])

        return Response(
            {
                "success": True,
                "message": "Vote recorded successfully",
                "meme_id": meme.id,
                "total_votes": total_votes,
                "avg_scores": {
                    "humor": avg_humor,
                },
            },
            status=status.HTTP_201_CREATED,
        )
