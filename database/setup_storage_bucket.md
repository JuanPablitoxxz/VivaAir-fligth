# 📦 Configurar Bucket de Storage en Supabase

## Pasos para crear el bucket "documents":

1. **Ve a Supabase Dashboard:**
   - https://supabase.com/dashboard
   - Selecciona tu proyecto

2. **Ve a Storage:**
   - En el menú lateral, haz clic en "Storage"
   - O ve directamente a: https://supabase.com/dashboard/project/[TU_PROJECT_ID]/storage/buckets

3. **Crea un nuevo bucket:**
   - Haz clic en "New bucket"
   - Nombre: `documents`
   - **Público:** NO (déjalo desmarcado)
   - Haz clic en "Create bucket"

4. **Configura las políticas (opcional pero recomendado):**

   Ve a "Policies" del bucket y crea estas políticas:

   **Política 1: Permitir subida a usuarios autenticados**
   ```sql
   CREATE POLICY "Users can upload certificates"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'documents');
   ```

   **Política 2: Permitir lectura a usuarios autenticados**
   ```sql
   CREATE POLICY "Users can read certificates"
   ON storage.objects FOR SELECT
   TO authenticated
   USING (bucket_id = 'documents');
   ```

   **Política 3: Permitir eliminación al creador (opcional)**
   ```sql
   CREATE POLICY "Users can delete own certificates"
   ON storage.objects FOR DELETE
   TO authenticated
   USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
   ```

5. **Listo:**
   - Ahora los certificados PDF se subirán correctamente
   - Se podrán ver desde el panel de administración

## Alternativa rápida (solo desarrollo):

Si quieres hacerlo público temporalmente:
- Crea el bucket como "Público"
- No necesitarás políticas, pero es menos seguro

