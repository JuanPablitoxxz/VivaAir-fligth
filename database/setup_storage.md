# Configuración de Supabase Storage para Certificados

Para que la funcionalidad de subida de certificados PDF funcione correctamente:

## Pasos:

1. Ve a Supabase Dashboard > Storage
2. Crea un nuevo bucket llamado `documents`
3. Configura las políticas de acceso:

```sql
-- Permitir subida de archivos a usuarios autenticados
CREATE POLICY "Users can upload certificates"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

-- Permitir lectura de archivos
CREATE POLICY "Users can read certificates"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');
```

4. O usa la política pública (menos seguro, solo para desarrollo):
   - En Storage > documents > Policies
   - Crear política pública para SELECT e INSERT

## Nota:

Si no configuras el storage, la aplicación seguirá funcionando pero solo guardará el nombre del archivo, no el archivo completo.

