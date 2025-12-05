from django.contrib.auth.models import User
from rest_framework import serializers
from dev_sistema_escolar_api.models import *
import re 
import datetime 

#  SERIALIZER DE USUARIO BASE 
class UserSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    email = serializers.CharField(required=True)

    class Meta:
        model = User
        fields = ('id','first_name','last_name', 'email')

    def validate_first_name(self, value):
        if not re.match(r"^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$", value):
            raise serializers.ValidationError("El nombre solo debe contener letras.")
        return value

    def validate_last_name(self, value):
        if not re.match(r"^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$", value):
            raise serializers.ValidationError("El apellido solo debe contener letras.")
        return value

#  SERIALIZER DE ADMINISTRADORES 
class AdminSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = Administradores
        fields = '__all__'

    def validate_clave_admin(self, value):
        if len(value) != 10:
            raise serializers.ValidationError("La clave debe tener exactamente 10 caracteres.")
        return value

    def validate_telefono(self, value):
        if not re.match(r"^\d{10}$", value):
            raise serializers.ValidationError("El teléfono debe tener 10 números.")
        return value

    def validate_rfc(self, value):
        if not re.match(r"^[A-Z0-9]{12,13}$", value.upper()):
            raise serializers.ValidationError("El RFC debe ser alfanumérico y tener 12 o 13 caracteres.")
        return value

    def validate_edad(self, value):
        if value < 18 or value > 99:
            raise serializers.ValidationError("La edad debe estar entre 18 y 99 años.")
        return value

    def validate_ocupacion(self, value):
        if not re.match(r"^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$", value):
            raise serializers.ValidationError("La ocupación solo debe contener letras.")
        return value

# SERIALIZER DE ALUMNOS
class AlumnoSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = Alumnos
        fields = "__all__"

    def validate_matricula(self, value):
        if not re.match(r"^\d{9}$", value):
            raise serializers.ValidationError("La matrícula debe tener 9 números.")
        return value

    def validate_curp(self, value):
        if not re.match(r"^[A-Z0-9]{18}$", value.upper()):
            raise serializers.ValidationError("La CURP debe tener 18 caracteres alfanuméricos.")
        return value

    def validate_rfc(self, value):
        if not re.match(r"^[A-Z0-9]{12,13}$", value.upper()):
            raise serializers.ValidationError("El RFC debe tener entre 12 y 13 caracteres.")
        return value

    def validate_telefono(self, value):
        if not re.match(r"^\d{10}$", value):
            raise serializers.ValidationError("El teléfono debe tener 10 números.")
        return value
    
    def validate_edad(self, value):
        if value < 18:
            raise serializers.ValidationError("La edad debe ser mayor o igual a 18.")
        return value
    
    def validate_ocupacion(self, value):
        if not re.match(r"^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$", value):
            raise serializers.ValidationError("La ocupación solo debe contener letras.")
        return value

    def validate_fecha_nacimiento(self, value):
        import datetime
        today = datetime.date.today()
        
        if isinstance(value, datetime.datetime):
            fecha_valor = value.date()
        else:
            fecha_valor = value
            
        if fecha_valor > today:
            raise serializers.ValidationError("La fecha de nacimiento no puede ser futura.")
        age = today.year - fecha_valor.year - ((today.month, today.day) < (fecha_valor.month, fecha_valor.day))
        if age < 18:
            raise serializers.ValidationError("El maestro debe ser mayor de 18 años.")
        
        return value

#  SERIALIZER DE MAESTROS 
class MaestroSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    materias_json = serializers.JSONField(required=True)
    class Meta:
        model = Maestros
        fields = '__all__'
    
    def validate_id_trabajador(self, value):
        if len(value) != 9: 
            raise serializers.ValidationError("El ID de trabajador debe tener 9 caracteres.")
        return value

    def validate_rfc(self, value):
        if not re.match(r"^[A-Z0-9]{12,13}$", value.upper()):
            raise serializers.ValidationError("El RFC debe tener entre 12 y 13 caracteres.")
        return value

    def validate_telefono(self, value):
        if not re.match(r"^\d{10}$", value):
            raise serializers.ValidationError("El teléfono debe tener 10 números.")
        return value

    def validate_cubiculo(self, value):
        if not value or len(value.strip()) == 0:
            raise serializers.ValidationError("El cubículo no puede estar vacío.")
        return value

    def validate_area_investigacion(self, value):
        if not value:
            raise serializers.ValidationError("Debe seleccionar un área de investigación.")
        return value

    def validate_materias_json(self, value):
        if not value or len(value) == 0:
            raise serializers.ValidationError("Debe seleccionar al menos una materia.")
        return value

    #  Validación de fecha para Maestros 
    def validate_fecha_nacimiento(self, value):
        import datetime
        today = datetime.date.today()
        
        if isinstance(value, datetime.datetime):
            fecha_valor = value.date()
        else:
            fecha_valor = value
            
        if fecha_valor > today:
            raise serializers.ValidationError("La fecha de nacimiento no puede ser futura.")
        age = today.year - fecha_valor.year - ((today.month, today.day) < (fecha_valor.month, fecha_valor.day))
        if age < 18:
            raise serializers.ValidationError("El maestro debe ser mayor de 18 años.")
        
        return value
    
class EventosSerializer(serializers.ModelSerializer):
    responsable_nombre = serializers.SerializerMethodField()
    publico_objetivo = serializers.JSONField(required=True)

    class Meta:
        model = Eventos
        fields = '__all__'

    def get_responsable_nombre(self, obj):
        return f"{obj.responsable.first_name} {obj.responsable.last_name}"

    def validate_nombre_evento(self, value):
        if not re.match(r"^[a-zA-Z0-9\sñÑáéíóúÁÉÍÓÚ]+$", value):
            raise serializers.ValidationError("El nombre del evento solo permite letras, números y espacios.")
        return value

    def validate_lugar(self, value):
        if not re.match(r"^[a-zA-Z0-9\sñÑáéíóúÁÉÍÓÚ]+$", value):
            raise serializers.ValidationError("El lugar solo permite caracteres alfanuméricos.")
        return value

    def validate_fecha(self, value):
        today = datetime.date.today()
        if value < today:
            raise serializers.ValidationError("La fecha del evento no puede ser anterior al día actual.")
        return value

    def validate_descripcion(self, value):
        if len(value) > 300:
            raise serializers.ValidationError("La descripción no puede exceder los 300 caracteres.")
        if not re.match(r"^[a-zA-Z0-9\sñÑáéíóúÁÉÍÓÚ.,:;()¿?¡!\-]+$", value):
            raise serializers.ValidationError("La descripción contiene caracteres no permitidos.")
        return value

    def validate_cupo_maximo(self, value):
        if value <= 0:
            raise serializers.ValidationError("El cupo debe ser un número positivo.")
        if value > 999:
            raise serializers.ValidationError("El cupo está limitado a 3 dígitos.")
        return value
    
    def validate_publico_objetivo(self, value):
        if not value or len(value) == 0:
            raise serializers.ValidationError("Debe seleccionar al menos un público objetivo.")
        return value

    def validate(self, data):
        if 'hora_inicio' in data and 'hora_fin' in data:
            if data['hora_inicio'] >= data['hora_fin']:
                raise serializers.ValidationError({"hora_fin": "La hora de finalización debe ser posterior a la hora de inicio."})
        return data