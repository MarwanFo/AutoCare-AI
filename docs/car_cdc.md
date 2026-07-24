



# **Sommaire** 

|**1**<br>**Contexte** . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . . .<br>2|
|---|---|
|**2**<br>**Présentation du projet** . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . . .<br>2|
|**3**<br>**Objectifs** . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . . .<br>2|
|**4**<br>**Problématique** . . . . . . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . . .<br>3|
|**5**<br>**Solution proposée**<br>. . . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . . .<br>3|
|**6**<br>**Utilisateurs & rôles** . . . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . . .<br>3|
|**7**<br>**Fonctionnalités détaillées** . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . . .<br>4|
|7.1<br>Authentifcation & profl. . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . . .<br>4|
|7.2<br>Gestion des véhicules . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . . .<br>4|
|7.3<br>Gestion des composants<br>. . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . . .<br>4|
|7.4<br>Historique de maintenance<br>. . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . . .<br>4|
|7.5<br>Scanner de facture intelligent (IA) . . . . . . . . . . . . . . . .|. . . . . . . . . . . . .<br>4|
|7.6<br>Assistant IA conversationnel (Gemini)<br>. . . . . . . . . . . . .|. . . . . . . . . . . . .<br>4|
|7.7<br>Maintenance prédictive<br>. . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . . .<br>5|
|7.8<br>Notifcations intelligentes<br>. . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . . .<br>5|
|7.9<br>Tableau de bord<br>. . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . . .<br>5|
|7.10 Analyse fnancière . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . . .<br>5|
|7.11 Estimation de la valeur du véhicule . . . . . . . . . . . . . . .|. . . . . . . . . . . . .<br>5|
|**8**<br>**Exigences non fonctionnelles**<br>. . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . . .<br>5|
|**9**<br>**Architecture technique** . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . . .<br>5|
|9.1<br>Stack technique. . . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . . .<br>6|
|9.2<br>Pourquoi Gemini ? . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . . .<br>6|
|9.3<br>Schéma d’architecture . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . . .<br>6|
|9.4<br>Organisation du code<br>. . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . . .<br>7|
|**10 Modèle de données** . . . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . . .<br>7|
|**11 Périmètre MVP vs Évolutions** . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . . .<br>8|
|**12 Livrables** . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . . .<br>8|
|**13 Planning prévisionnel**<br>. . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . . .<br>9|
|**14 Risques et mesures d’atténuation** . . . . . . . . . . . . . . . . .|. . . . . . . . . . . . .<br>9|
|**15 Critères d’acceptation** . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . . .<br>9|
|**16 Perspectives d’évolution**. . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . . .<br>9|



AutoCare AI — Cahier des Charges 

v2.0 

# **1 Contexte** 

L’entretien régulier d’un véhicule est indispensable pour garantir sa sécurité, sa fiabilité et prolonger sa durée de vie. Cependant, la majorité des propriétaires ne disposent pas d’un historique structuré des opérations de maintenance effectuées sur leur véhicule. 

Les informations sont souvent dispersées entre plusieurs factures, carnets papier ou souvenirs approximatifs, ce qui entraîne des oublis de maintenance, des dépenses imprévues et une diminution de la valeur de revente du véhicule. 

L’intelligence artificielle générative offre aujourd’hui la possibilité d’automatiser une grande partie du suivi de maintenance, d’analyser l’état général du véhicule et d’assister le propriétaire dans ses décisions, via une simple conversation en langage naturel ou la lecture automatique de documents. 

Ce projet consiste donc à développer une application mobile intelligente permettant de centraliser toutes les informations relatives à un véhicule tout en proposant des recommandations personnalisées grâce à l’IA (Google Gemini). 

# **2 Présentation du projet** 

**AutoCare AI** est une application mobile permettant aux utilisateurs de gérer l’ensemble de leurs véhicules, de suivre leur historique de maintenance, de recevoir des rappels intelligents et de bénéficier d’une assistance conversationnelle basée sur l’intelligence artificielle (Gemini). 

L’application constitue un véritable _carnet de santé numérique_ pour chaque véhicule : chaque pièce mécanique est suivie individuellement, avec son état, son usure estimée et son historique d’intervention. 

**Valeur ajoutée principale :** transformer un suivi papier/mémoire, dispersé et sujet à l’oubli, en un tableau de bord centralisé, prédictif et conversationnel. 

# **3 Objectifs** 

L’application devra permettre de : 

- Gérer plusieurs véhicules par utilisateur. 

- Centraliser l’historique complet des interventions. 

- Suivre l’état et le taux d’usure de chaque composant du véhicule. 

- Générer automatiquement le profil complet d’un véhicule neuf. 

- Simplifier l’ajout et la reconstitution de l’historique d’un véhicule d’occasion. 

- Extraire automatiquement les données d’une facture scannée grâce à l’IA (OCR + Gemini). 

- Prédire les prochaines opérations de maintenance à partir du kilométrage et de l’historique. 

2 

AutoCare AI — Cahier des Charges 

v2.0 

- Envoyer des notifications intelligentes et contextualisées. 

- Produire des statistiques et une analyse des dépenses automobiles. 

- Estimer la valeur actuelle de revente du véhicule. 

# **4 Problématique** 

Les propriétaires de véhicules rencontrent plusieurs difficultés récurrentes : 

|**Diffculté rencontrée**|**Conséquence**|
|---|---|
|Oubli des dates de maintenance|Usure prématurée, panne évitable|
|Perte des factures papier|Impossible de prouver l’entretien à la revente|
|Méconnaissance de l’état réel<br>des pièces|Décision de réparation mal informée|
|Absence d’anticipation des<br>pannes|Coûts de réparation plus élevés|
|Mauvais suivi budgétaire|Dépenses imprévues, absence de visibilité|
|Manque d’historique lors de la<br>revente|Perte de valeur du véhicule|



# **5 Solution proposée** 

Développer une application mobile utilisant l’intelligence artificielle (Google Gemini) afin de : 

- Créer automatiquement un carnet d’entretien numérique dès l’ajout du véhicule. 

- Assister l’utilisateur en langage naturel dans la gestion de son véhicule. 

- Automatiser le suivi des pièces mécaniques et le calcul de leur usure. 

- Fournir des recommandations personnalisées selon l’usage réel du véhicule. 

- Anticiper les futures opérations de maintenance et les risques de panne. 

# **6 Utilisateurs & rôles** 

### **Conducteur particulier** 

- Gestion de ses véhicules 

- Consultation de l’historique 

- Réception des rappels et notifications 

- Analyse de ses dépenses 

- Discussion avec l’assistant IA 

### **Administrateur** 

- Gestion des comptes utilisateurs 

- Gestion des marques et modèles 

- Gestion du référentiel de composants 

- Consultation des statistiques globales 

- Supervision de la plateforme 

3 

AutoCare AI — Cahier des Charges 

v2.0 

# **7 Fonctionnalités détaillées** 

## **Authentification & profil** 

- Création de compte (email / mot de passe) 

- Connexion sécurisée (JWT + Refresh Token) 

- Réinitialisation du mot de passe 

- Gestion du profil utilisateur 

## **Gestion des véhicules** 

**Ajout d’un véhicule** — informations collectées : marque, modèle, année, motorisation, type de carburant, transmission, kilométrage actuel, immatriculation, date d’achat. 

### **Cas d’un véhicule neuf** 

Après validation, l’application crée automatiquement l’ensemble des composants standards du véhicule avec : état « Neuf », santé 100 %, date et kilométrage d’installation, durée de vie estimée. Composants créés notamment : huile moteur, filtre à huile, filtre à air, filtre habitacle, filtre carburant, batterie, pneus, plaquettes de frein, disques de frein, bougies, liquide de refroidissement, courroie de distribution, amortisseurs, embrayage, essuie-glaces, climatisation, éclairage, etc. 

### **Cas d’un véhicule d’occasion** 

Les mêmes composants sont créés, mais avec un état initial « Inconnu ». L’utilisateur peut ensuite modifier manuellement les informations, scanner ses anciennes factures ou ajouter les interventions passées progressivement afin de reconstituer l’historique réel. 

## **Gestion des composants** 

Chaque composant possède : nom, date d’installation, kilométrage d’installation, état, pourcentage d’usure, garantie, durée de vie estimée, historique des interventions liées. 

## **Historique de maintenance** 

Pour chaque intervention : date, kilométrage, garage, description, pièces remplacées, coût, facture associée, garantie. 

## **Scanner de facture intelligent (IA)** 

L’utilisateur photographie une facture. Le pipeline IA (OCR + Gemini) extrait automatiquement : date, garage, montant, kilométrage, pièces remplacées, main-d’œuvre. Les données structurées sont ensuite proposées à l’utilisateur pour validation avant enregistrement définitif. 

## **Assistant IA conversationnel (Gemini)** 

L’utilisateur peut échanger en langage naturel avec l’application, par exemple : « J’ai changé les plaquettes de frein la semaine dernière ». L’assistant, propulsé par l’API Gemini, pose les questions complémentaires nécessaires (kilométrage, garage, coût) puis enregistre automatiquement l’intervention dans l’historique du composant concerné. 

4 

AutoCare AI — Cahier des Charges 

v2.0 

## **Maintenance prédictive** 

Le moteur IA analyse l’âge du véhicule, le kilométrage, les pièces déjà remplacées, les recommandations constructeur et l’historique complet, afin de calculer : les prochaines échéances de maintenance, les pièces à remplacer prochainement, et une estimation du risque de panne par composant. 

## **Notifications intelligentes** 

Exemples : « Vidange dans 850 km », « Batterie âgée de 4 ans », « Assurance bientôt expirée », « Contrôle technique à prévoir ». 

## **Tableau de bord** 

Affichage de : nombre de véhicules, dépenses mensuelles et annuelles, répartition des coûts par catégorie, coût par kilomètre, état de santé global du véhicule. 

## **Analyse financière** 

Suivi des dépenses par catégorie : carburant, entretien, assurance, taxes, parking, lavage, réparations. 

## **Estimation de la valeur du véhicule** 

L’IA estime la valeur actuelle de revente du véhicule selon son âge, son kilométrage, la qualité de son historique d’entretien et son état général. 

# **8 Exigences non fonctionnelles** 

|**Catégorie**|**Exigence**|
|---|---|
|Ergonomie|Interface moderne, intuitive, adaptée à un usage mobile rapide|
|Performance|Temps de réponse API_<_300 ms hors appels IA ; retour visuel systéma-<br>tique pendant les traitements IA|
|Sécurité|Authentifcation JWT, chiffrement des mots de passe (BCrypt), validation<br>des entrées, protection CORS|
|Confdentialité des<br>données|Isolation stricte des données par utilisateur, minimisation des données<br>envoyées à l’API Gemini|
|Fiabilité|Sauvegarde automatique, gestion des erreurs et messages explicites|
|Évolutivité|Architecture en couches, séparation claire des responsabilités (controller<br>/ service / repository)|
|Compatibilité|Application testée sur Android (et iOS si le temps le permet)|
|Disponibilité|Hébergement cloud avec objectif de disponibilité_>_99 %|



# **9 Architecture technique** 

5 

AutoCare AI — Cahier des Charges 

v2.0 

## **Stack technique** 

|**Couche**|**Technologies**|
|---|---|
|Frontend (mobile)|React Native, TypeScript, React Navigation, TanStack Query (React<br>Query), Axios, NativeWind (Tailwind CSS)|
|Backend|Java 21, Spring Boot 3, Spring Security (JWT), Spring Data JPA / Hiber-<br>nate, Spring Validation, Maven|
|Base de données|PostgreSQL|
|Authentifcation|JWT Access Token + Refresh Token|
|Stockage fchiers|Cloudinary (images des factures et véhicules)|
|Intelligence<br>artifcielle|Google Gemini API (assistant conversationnel, extraction et structuration<br>de données, aide à la maintenance prédictive)|
|OCR|Google ML Kit ou Tesseract OCR (pré-traitement des factures avant envoi<br>à Gemini)|
|Outils|Docker, Postman, Git & GitHub, Swagger/OpenAPI, Figma, IntelliJ IDEA,<br>VS Code|



## **Pourquoi Gemini ?** 

L’API Google Gemini est utilisée pour deux usages complémentaires : (1) la **compréhension et structuration** du texte brut extrait d’une facture (dates, montants, pièces, garage) en JSON exploitable par le backend, et (2) l’ **assistant conversationnel** qui interprète les messages libres de l’utilisateur et les transforme en actions concrètes (création d’une intervention, mise à jour d’un composant). Spring Boot appelle l’API Gemini via un client HTTP dédié (WebClient), sans dépendance à un SDK tiers non maintenu. 

## **Schéma d’architecture** 



<!-- Start of picture text -->
React Native<br>(Mobile App)<br>REST / JSON<br>Spring Boot API<br>(Java 21)<br>PostgreSQL Cloudinary Google Gemini API<br><!-- End of picture text -->

6 

AutoCare AI — Cahier des Charges 

v2.0 

## **Organisation du code** 

**Mobile — React Native** `src/ |-- components/ |-- screens/ |-- navigation/ |-- services/ |-- hooks/ |-- context/ |-- store/ |-- utils/ |-- assets/ |-- types/ ‘-- constants/` 

**Backend — Spring Boot** `src/main/java |-- config/ |-- controller/ |-- service/ |-- repository/ |-- entity/ |-- dto/ |-- mapper/ |-- security/ |-- exception/ |-- ai/ (client Gemini) |-- notification/ ‘-- utils/` 

# **<mark>10</mark> Modèle de données** 

Principales entités identifiées : 

|**Entité**|**Rôle**|
|---|---|
|Utilisateur|Compte, rôle (conducteur / admin), informations de connexion|
|Véhicule|Informations générales du véhicule, lié à un utilisateur|
|Marque / Modèle|Référentiel constructeur|
|Composant|Pièce suivie individuellement (état, usure, durée de vie)|
|HistoriqueMaintenance|Intervention réalisée sur un composant|
|Facture|Document scanné, données extraites par l’IA|
|Dépense|Ligne fnancière rattachée à une catégorie|
|Notifcation|Alerte générée pour l’utilisateur|
|Garantie|Couverture associée à un composant ou une intervention|
|ConversationIA|Historique des échanges avec l’assistant Gemini|



**<mark>11</mark> Périmètre MVP vs Évolutions** 

7 

AutoCare AI — Cahier des Charges 

v2.0 

|**Fonctionnalité**|**Statut**|
|---|---|
|Authentifcation JWT|**MVP**|
|Gestion de plusieurs véhicules|**MVP**|
|Création automatique des composants (neuf / occasion)|**MVP**|
|Historique des interventions|**MVP**|
|Scanner de factures (OCR + Gemini)|**MVP**|
|Assistant IA conversationnel simple|**MVP**|
|Tableau de bord & dépenses|**MVP**|
|Notifcations intelligentes|**MVP**(règles simples)|
|Maintenance prédictive avancée|**V2**|
|Estimation de la valeur de revente|**V2**|
|Notifcations push natives|**V2**|



Ce découpage MVP / V2 permet de sécuriser une soutenance sur un périmètre réaliste tout en gardant une vision produit ambitieuse. 

# **<mark>12</mark> Livrables** 

- Application mobile Android (build de démonstration) 

- API REST documentée (Swagger/OpenAPI) 

- Base de données PostgreSQL avec scripts de migration 

- Documentation technique (architecture, choix techniques) 

- Documentation utilisateur 

- Rapport de stage 

- Support de présentation / soutenance 

# **<mark>13</mark> Planning prévisionnel** 

8 

AutoCare AI — Cahier des Charges 

v2.0 

|**Période**|**Objectifs**|
|---|---|
|Semaine 1|Analyse des besoins, cahier des charges, maquettage UI/UX (Figma)|
|Semaine 2|Modélisation base de données, mise en place Spring Boot, authentifcation<br>JWT|
|Semaine 3|Gestion des véhicules, gestion des composants, historique de maintenance|
|Semaine 4|Intégration OCR, intégration API Gemini (scanner + assistant), notifcations|
|Semaine 5|Tableau de bord, tests, corrections, déploiement, fnalisation de la documen-<br>tation|



# **<mark>14</mark> Risques et mesures d’atténuation** 

|**Risque**|**Impact**|**Mesure d’atténuation**|
|---|---|---|
|Quota / coût de l’API|Moyen|Mise en cache des réponses, limitation du volume de|
|Gemini||tokens, mode dégradé sans IA|
|Qualité variable de<br>l’OCR sur factures<br>manuscrites|Moyen|Validation manuelle obligatoire avant enregistrement|
|Périmètre trop large pour<br>la durée du stage|Élevé|Priorisation stricte MVP / V2 (voir section 11)|
|Sécurité des données<br>personnelles|Élevé|JWT, chiffrement, isolation des données par utilisateur|



# **<mark>15</mark> Critères d’acceptation** 

- Un utilisateur peut créer un compte, se connecter et ajouter un véhicule neuf avec génération automatique de ses composants. 

- Un utilisateur peut scanner une facture et voir les champs extraits automatiquement avant validation. 

- L’assistant IA peut enregistrer une intervention simple décrite en langage naturel. 

- Le tableau de bord affiche correctement les dépenses totales et leur répartition par catégorie. 

- Une notification est générée lorsque le kilométrage restant avant une vidange passe sous un seuil défini. 

# **<mark>16</mark> Perspectives d’évolution** 

- Connexion Bluetooth OBD-II pour lecture directe des données véhicule. 

- Détection de pannes à partir des codes défauts. 

9 

AutoCare AI — Cahier des Charges 

v2.0 

- Détection de l’usure des pneus via analyse d’image. 

- Portail dédié aux garages partenaires. 

- Marketplace de pièces automobiles. 

- Synchronisation avec les compagnies d’assurance. 

- Assistant vocal intelligent. 

- QR Code contenant l’historique complet du véhicule pour faciliter la revente. 

AutoCare AI — Cahier des Charges v2.0 — Document généré pour usage académique 

10 

