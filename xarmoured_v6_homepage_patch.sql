-- Xarmoured v6 homepage patch (CMS content only). NOT executed by the build.
--
-- The simplified homepage reads its closing call to action from the homepage record's
-- `final_cta` field when one is set, so an older value would otherwise keep showing.
-- This sets it to the approved line. It merges one key and changes nothing else.
-- BACK UP FIRST. Safe to re-run. Does not touch research, settings, status or any other record.

begin;

update public.records
   set data = coalesce(data, '{}'::jsonb) || $xj${"final_cta": "Have an application\nthat needs testing?"}$xj$::jsonb,
       updated_at = now()
 where module = 'pages' and slug = 'home';

commit;
