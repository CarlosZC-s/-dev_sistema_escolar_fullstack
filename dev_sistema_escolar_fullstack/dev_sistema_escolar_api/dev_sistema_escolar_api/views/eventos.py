from django.shortcuts import render
from django.db.models import *
from django.db import transaction
from dev_sistema_escolar_api.serializers import EventosSerializer
from dev_sistema_escolar_api.models import Eventos
from rest_framework.views import APIView
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
import json

class EventosAll(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    
    def get(self, request, *args, **kwargs):
        eventos = Eventos.objects.all().order_by("fecha")
        lista = EventosSerializer(eventos, many=True).data
        
        for evento in lista:
            if "publico_objetivo" in evento:
                try:
                    raw_data = evento["publico_objetivo"]
                    if isinstance(raw_data, str):
                        raw_data = raw_data.replace("'", '"')
                        evento["publico_objetivo"] = json.loads(raw_data)
                except Exception:
                    evento["publico_objetivo"] = []
                    
        return Response(lista, 200)

class EventosView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, *args, **kwargs):
        evento = get_object_or_404(Eventos, id=request.GET.get("id"))
        data = EventosSerializer(evento, many=False).data
        
        if "publico_objetivo" in data:
            try:
                raw_data = data["publico_objetivo"]
                if isinstance(raw_data, str):
                    raw_data = raw_data.replace("'", '"')
                    data["publico_objetivo"] = json.loads(raw_data)
            except Exception:
                data["publico_objetivo"] = []
                
        return Response(data, 200)

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        serializer = EventosSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Evento registrado correctamente"}, 201)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @transaction.atomic
    def put(self, request, *args, **kwargs):
        evento = get_object_or_404(Eventos, id=request.data["id"])
        serializer = EventosSerializer(evento, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Evento actualizado correctamente"}, 200)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @transaction.atomic
    def delete(self, request, *args, **kwargs):
        evento = get_object_or_404(Eventos, id=request.GET.get("id"))
        evento.delete() 
        return Response({"message": "Evento eliminado correctamente"}, 200)