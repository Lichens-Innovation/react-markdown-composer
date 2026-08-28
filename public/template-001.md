<!-- template principal : en-tête -->
| Info | Valeur saisie |
|---|---|
| Inspecté par | **{{formData.text1}}** |
| Fonction | **{{formData.select1}}** |
| Date de l'inspection | **{{formData.date1}}** |
| Météo | **{{formData.select2}}** |

<!-- inline: row -->
{{#*inline "row"}}
| {{title}} | <span style="color:{{statusColor rawStatus @root.statusColors}}">**{{t (concat "configuration.statusOptions." rawStatus)}}**</span> | {{comment}} |
{{/inline}}
<!-- inline: row END -->

<!-- inline: photoBlock -->
{{#*inline "photoBlock"}}{{#if pictures.length}}
<!--keep-->
**{{title}}** — photos :

{{{markdownImagesTable pictures @root.printableImages columns=3}}}
<!--/keep-->
{{/if}}{{/inline}}
<!-- inline: photoBlock END -->

<!-- template principal : sections -->
<!-- boucle: sections -->
{{#each sections}}
{{#if (hasType fields "STATUS")}}
<!-- boucle: fields STATUS → row -->
<!--keep-->
| {{title}} | Statut | Commentaire |
|---|---|---|
{{#each fields}}{{#if (eq type "STATUS")}}{{> row}}{{/if}}{{/each}}
<!--/keep-->
<!-- boucle: fields STATUS → photoBlock -->
{{#each fields}}{{#if (eq type "STATUS")}}{{> photoBlock}}{{/if}}{{/each}}
{{else if (hasType fields "TEXT_ANSWER")}}
{{#if title}}
### {{title}}
{{/if}}
<!-- boucle: fields TEXT_ANSWER -->
{{#each fields}}{{#if (eq type "TEXT_ANSWER")}}
- {{textAnswer}}
{{/if}}{{/each}}
{{else if title}}
### {{title}}
{{/if}}
{{/each}}

<!-- template principal : légende -->
### Légende

| Code | Statut |
|---|---|
| C | <span style="color:#43A047">**Conforme**</span> |
| AR | <span style="color:#FDD835">**Requiert attention**</span> |
| NC | <span style="color:#E53935">**Non-conforme**</span> |
| NI | <span style="color:#9E9E9E">**Non-inspecté**</span> |

<!-- template principal : observations -->
### Observations
<!-- boucle: formData.repeatable2 -->
{{#each formData.repeatable2}}
**Endroit :** {{text1}}
**Type :** {{text2}}
**Observations :** {{text3}}

{{{markdownImagesTable [media-gallery1] @root.printableImages columns=3}}}
---
{{/each}}
