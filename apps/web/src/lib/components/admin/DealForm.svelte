<!--
	Create/edit form for a deal: details, images, branches, eligible cards, valid days and coupon codes.
	Dates are typed in Sri Lanka time and sent as UTC. Submits one JSON "payload" to the page's `save` action.
-->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { t } from '@saveroo/shared/i18n';
	import { colomboLocalToUtc, utcToColomboLocal } from '@saveroo/shared/time';
	import { SAVING_FIELDS, type AdminBranch, type AdminDeal, type AdminReference, type ApiError, type SavingField } from '@saveroo/shared';
	import Field from './Field.svelte';
	import ImageField from './ImageField.svelte';

	let {
		deal,
		merchant,
		reference,
		supabaseUrl,
		error
	}: {
		deal: AdminDeal | null;
		merchant: { id: string; name: string; branches: AdminBranch[] };
		reference: AdminReference;
		supabaseUrl: string;
		error: ApiError | null;
	} = $props();

	const input = 'w-full rounded-lg border border-gray-300 px-3 py-2';
	const small = 'rounded-lg border border-gray-300 px-2 py-1.5';
	const fields = $derived(error?.fields ?? {});
	const DEAL_TYPES = ['percent_off', 'amount_off', 'bogo', 'freebie', 'cashback', 'coupon_code', 'price_drop', 'bundle', 'other'] as const;
	const DAYS = [1, 2, 3, 4, 5, 6, 7] as const;
	const CARD_TYPES = ['credit', 'debit', 'prepaid', 'loyalty', 'other'] as const;

	const local = (iso: string | null | undefined) => (iso ? utcToColomboLocal(iso) : '');
	const str = (v: number | null | undefined) => (v === null || v === undefined ? '' : String(v));

	// svelte-ignore state_referenced_locally
	const d = deal;
	let title = $state(d?.title ?? '');
	let slug = $state(d?.slug ?? '');
	let description = $state(d?.description ?? '');
	let categoryId = $state(d?.categoryId ?? '');
	let brandId = $state(d?.brandId ?? '');
	let dealType = $state<(typeof DEAL_TYPES)[number]>(d?.dealType ?? 'percent_off');
	let discountPercent = $state(str(d?.discountPercent));
	let discountAmountLkr = $state(str(d?.discountAmountLkr));
	let maxSavingLkr = $state(str(d?.maxSavingLkr));
	let minSpendLkr = $state(str(d?.minSpendLkr));
	let originalPriceLkr = $state(str(d?.originalPriceLkr));
	let dealPriceLkr = $state(str(d?.dealPriceLkr));
	let channel = $state(d?.channel ?? 'in_store');
	let startsAt = $state(local(d?.startsAt));
	let endsAt = $state(local(d?.endsAt));
	let terms = $state(d?.terms ?? '');
	let howToRedeem = $state(d?.howToRedeem ?? '');
	let sourceUrl = $state(d?.sourceUrl ?? '');
	let verification = $state(d?.verification ?? 'unverified');
	let isFeatured = $state(d?.isFeatured ?? false);
	let imageKey = $state<string | null>(d?.imageKey ?? null);
	let proofImageKey = $state<string | null>(d?.proofImageKey ?? null);
	let branchIds = $state<string[]>(d?.branchIds ?? []);
	let eligibility = $state(
		(d?.eligibility ?? []).map((e) => ({ providerId: e.providerId, cardProductId: e.cardProductId ?? '', cardType: e.cardType ?? '', note: e.note ?? '' }))
	);
	let schedules = $state(
		(d?.schedules ?? []).map((s) => ({
			daysOfWeek: [...s.daysOfWeek],
			startTime: s.startTime ?? '',
			endTime: s.endTime ?? '',
			validFrom: s.validFrom ?? '',
			validTo: s.validTo ?? '',
			blackoutDates: s.blackoutDates.join(', '),
			note: s.note ?? ''
		}))
	);
	let coupons = $state(
		(d?.coupons ?? []).map((c) => ({ code: c.code, kind: c.kind, usageLimit: str(c.usageLimit), validFrom: local(c.validFrom), validTo: local(c.validTo) }))
	);

	/** Saving fields that apply to the chosen deal type (others are hidden and not sent). */
	const shows = (field: SavingField) => SAVING_FIELDS[dealType].includes(field);
	const cardsOf = (providerId: string) => reference.cardProducts.filter((c) => c.providerId === providerId);
	const toNumber = (v: string) => (v.trim() === '' ? null : Number(v.replace(/,/g, '')));
	/** Colombo wall-clock to UTC; an unreadable value is sent as-is so the API flags the field. */
	const toUtc = (v: string) => {
		if (!v) return null;
		try {
			return colomboLocalToUtc(v);
		} catch {
			return v;
		}
	};

	const payload = $derived(
		JSON.stringify({
			id: d?.id ?? null,
			merchantId: merchant.id,
			slug: slug.trim() || null,
			title,
			description,
			categoryId: categoryId || null,
			brandId: brandId || null,
			dealType,
			discountPercent: shows('discountPercent') ? toNumber(discountPercent) : null,
			discountAmountLkr: shows('discountAmountLkr') ? toNumber(discountAmountLkr) : null,
			maxSavingLkr: shows('maxSavingLkr') ? toNumber(maxSavingLkr) : null,
			minSpendLkr: shows('minSpendLkr') ? toNumber(minSpendLkr) : null,
			originalPriceLkr: shows('originalPriceLkr') ? toNumber(originalPriceLkr) : null,
			dealPriceLkr: shows('dealPriceLkr') ? toNumber(dealPriceLkr) : null,
			channel,
			startsAt: toUtc(startsAt) ?? new Date().toISOString(),
			endsAt: toUtc(endsAt),
			terms,
			howToRedeem,
			sourceUrl: sourceUrl.trim() || null,
			verification,
			isFeatured,
			imageKey,
			proofImageKey,
			branchIds,
			eligibility: eligibility.map((e) => ({
				providerId: e.providerId,
				cardProductId: e.cardProductId || null,
				cardType: e.cardType || null,
				note: e.note
			})),
			schedules: schedules.map((s) => ({
				daysOfWeek: s.daysOfWeek,
				startTime: s.startTime || null,
				endTime: s.endTime || null,
				validFrom: s.validFrom || null,
				validTo: s.validTo || null,
				blackoutDates: s.blackoutDates.split(/[\s,]+/).filter(Boolean),
				note: s.note
			})),
			coupons: coupons.map((c) => ({
				code: c.code,
				kind: c.kind,
				usageLimit: toNumber(c.usageLimit),
				validFrom: toUtc(c.validFrom),
				validTo: toUtc(c.validTo)
			}))
		})
	);

	function toggleDay(schedule: { daysOfWeek: number[] }, day: number) {
		schedule.daysOfWeek = schedule.daysOfWeek.includes(day)
			? schedule.daysOfWeek.filter((x) => x !== day)
			: [...schedule.daysOfWeek, day].sort();
	}
</script>

<form method="POST" action="?/save" use:enhance class="space-y-8">
	<input type="hidden" name="payload" value={payload} />

	{#if error}
		<div class="rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">
			<p>{error.message}</p>
			{#if fields._}<p>{fields._}</p>{/if}
		</div>
	{/if}

	<section class="space-y-4">
		<p class="text-sm text-gray-600">{t('admin.deal.merchant')}: <strong>{merchant.name}</strong></p>
		<div class="grid gap-4 md:grid-cols-2">
			<Field label={t('admin.deal.title')} error={fields.title}>
				<input class={input} bind:value={title} required maxlength="140" />
			</Field>
			<Field label={t('admin.slug')} error={fields.slug} hint={t('admin.slug_hint')}>
				<input class={input} bind:value={slug} maxlength="120" />
			</Field>
			<Field label={t('admin.deal.type')} error={fields.dealType}>
				<select class={input} bind:value={dealType}>
					{#each DEAL_TYPES as type (type)}<option value={type}>{t(`admin.deal_type.${type}`)}</option>{/each}
				</select>
			</Field>
			<Field label={t('admin.deal.category')} error={fields.categoryId}>
				<select class={input} bind:value={categoryId}>
					<option value="">–</option>
					{#each reference.categories as c (c.id)}<option value={c.id}>{c.parentId ? '— ' : ''}{c.name}</option>{/each}
				</select>
			</Field>
			{#if reference.brands.length}
				<Field label={t('admin.deal.brand')} error={fields.brandId}>
					<select class={input} bind:value={brandId}>
						<option value="">–</option>
						{#each reference.brands as b (b.id)}<option value={b.id}>{b.name}</option>{/each}
					</select>
				</Field>
			{/if}
			<Field label={t('admin.deal.channel')} error={fields.channel}>
				<select class={input} bind:value={channel}>
					<option value="in_store">{t('admin.channel.in_store')}</option>
					<option value="online">{t('admin.channel.online')}</option>
					<option value="both">{t('admin.channel.both')}</option>
				</select>
			</Field>
		</div>
		<Field label={t('admin.description')} error={fields.description}>
			<textarea class={input} rows="3" bind:value={description} maxlength="4000"></textarea>
		</Field>
	</section>

	<section class="space-y-4">
		<h2 class="text-lg font-semibold">{t('admin.deal.saving')}</h2>
		<div class="grid gap-4 md:grid-cols-3">
			{#if shows('discountPercent')}
				<Field label={t('admin.deal.discount_percent')} error={fields.discountPercent}>
					<input class={input} inputmode="decimal" bind:value={discountPercent} />
				</Field>
			{/if}
			{#if shows('discountAmountLkr')}
				<Field label={t('admin.deal.discount_amount')} error={fields.discountAmountLkr}>
					<input class={input} inputmode="decimal" bind:value={discountAmountLkr} />
				</Field>
			{/if}
			{#if shows('maxSavingLkr')}
				<Field label={t('admin.deal.max_saving')} error={fields.maxSavingLkr}>
					<input class={input} inputmode="decimal" bind:value={maxSavingLkr} />
				</Field>
			{/if}
			{#if shows('minSpendLkr')}
				<Field label={t('admin.deal.min_spend')} error={fields.minSpendLkr}>
					<input class={input} inputmode="decimal" bind:value={minSpendLkr} />
				</Field>
			{/if}
			{#if shows('originalPriceLkr')}
				<Field label={t('admin.deal.original_price')} error={fields.originalPriceLkr}>
					<input class={input} inputmode="decimal" bind:value={originalPriceLkr} />
				</Field>
			{/if}
			{#if shows('dealPriceLkr')}
				<Field label={t('admin.deal.deal_price')} error={fields.dealPriceLkr}>
					<input class={input} inputmode="decimal" bind:value={dealPriceLkr} />
				</Field>
			{/if}
		</div>
	</section>

	<section class="space-y-4">
		<h2 class="text-lg font-semibold">{t('admin.deal.when')}</h2>
		<div class="grid gap-4 md:grid-cols-2">
			<Field label={t('admin.deal.starts')} error={fields.startsAt} hint={t('admin.time_hint')}>
				<input class={input} type="datetime-local" bind:value={startsAt} />
			</Field>
			<Field label={t('admin.deal.ends')} error={fields.endsAt} hint={t('admin.deal.ends_hint')}>
				<input class={input} type="datetime-local" bind:value={endsAt} />
			</Field>
		</div>

		<div class="space-y-3">
			<h3 class="font-medium">{t('admin.deal.valid_days')}</h3>
			<p class="text-sm text-gray-600">{t('admin.deal.valid_days_hint')}</p>
			{#each schedules as schedule, i (i)}
				<div class="space-y-3 rounded-lg border p-3">
					<div class="flex flex-wrap gap-2" role="group" aria-label={t('admin.deal.valid_days')}>
						{#each DAYS as day (day)}
							<button
								type="button"
								class="rounded-lg border px-3 py-1.5 text-sm {schedule.daysOfWeek.includes(day) ? 'bg-black text-white' : ''}"
								aria-pressed={schedule.daysOfWeek.includes(day)}
								onclick={() => toggleDay(schedule, day)}
							>
								{t(`admin.day.${day}`)}
							</button>
						{/each}
					</div>
					{#if fields[`schedules.${i}.daysOfWeek`]}<p class="text-sm text-red-700">{fields[`schedules.${i}.daysOfWeek`]}</p>{/if}
					<div class="grid gap-3 md:grid-cols-4">
						<Field label={t('admin.schedule.from_time')} error={fields[`schedules.${i}.startTime`]}>
							<input class={input} type="time" bind:value={schedule.startTime} />
						</Field>
						<Field label={t('admin.schedule.to_time')} error={fields[`schedules.${i}.endTime`]}>
							<input class={input} type="time" bind:value={schedule.endTime} />
						</Field>
						<Field label={t('admin.schedule.valid_from')} error={fields[`schedules.${i}.validFrom`]}>
							<input class={input} type="date" bind:value={schedule.validFrom} />
						</Field>
						<Field label={t('admin.schedule.valid_to')} error={fields[`schedules.${i}.validTo`]}>
							<input class={input} type="date" bind:value={schedule.validTo} />
						</Field>
					</div>
					<Field label={t('admin.schedule.blackout')} error={fields[`schedules.${i}.blackoutDates.0`]} hint={t('admin.schedule.blackout_hint')}>
						<input class={input} bind:value={schedule.blackoutDates} placeholder="2026-12-25, 2027-01-01" />
					</Field>
					<button type="button" class="text-sm underline" onclick={() => schedules.splice(i, 1)}>{t('admin.remove')}</button>
				</div>
			{/each}
			<button
				type="button"
				class="rounded-lg border px-3 py-1.5 text-sm"
				onclick={() => schedules.push({ daysOfWeek: [], startTime: '', endTime: '', validFrom: '', validTo: '', blackoutDates: '', note: '' })}
			>
				{t('admin.schedule.add')}
			</button>
		</div>
	</section>

	<section class="space-y-3">
		<h2 class="text-lg font-semibold">{t('admin.deal.cards')}</h2>
		<p class="text-sm text-gray-600">{t('admin.deal.cards_hint')}</p>
		{#if fields.eligibility}<p class="text-sm text-red-700">{fields.eligibility}</p>{/if}
		{#each eligibility as row, i (i)}
			<div class="flex flex-wrap items-end gap-2 rounded-lg border p-3">
				<label class="text-sm">
					<span class="block">{t('admin.eligibility.provider')}</span>
					<select class={small} bind:value={row.providerId} onchange={() => (row.cardProductId = '')}>
						{#each reference.providers as p (p.id)}<option value={p.id}>{p.name}</option>{/each}
					</select>
				</label>
				<label class="text-sm">
					<span class="block">{t('admin.eligibility.card')}</span>
					<select class={small} bind:value={row.cardProductId}>
						<option value="">{t('admin.eligibility.any_card')}</option>
						{#each cardsOf(row.providerId) as c (c.id)}<option value={c.id}>{c.name}</option>{/each}
					</select>
				</label>
				<label class="text-sm">
					<span class="block">{t('admin.eligibility.card_type')}</span>
					<select class={small} bind:value={row.cardType}>
						<option value="">{t('admin.eligibility.any_type')}</option>
						{#each CARD_TYPES as type (type)}<option value={type}>{t(`admin.card_type.${type}`)}</option>{/each}
					</select>
				</label>
				<label class="text-sm">
					<span class="block">{t('admin.note')}</span>
					<input class={small} bind:value={row.note} maxlength="200" />
				</label>
				<button type="button" class="text-sm underline" onclick={() => eligibility.splice(i, 1)}>{t('admin.remove')}</button>
			</div>
		{/each}
		<button
			type="button"
			class="rounded-lg border px-3 py-1.5 text-sm"
			onclick={() => eligibility.push({ providerId: reference.providers[0]?.id ?? '', cardProductId: '', cardType: '', note: '' })}
		>
			{t('admin.eligibility.add')}
		</button>
	</section>

	{#if merchant.branches.length}
		<section class="space-y-3">
			<h2 class="text-lg font-semibold">{t('admin.deal.branches')}</h2>
			<p class="text-sm text-gray-600">{t('admin.deal.branches_hint')}</p>
			{#if fields.branchIds}<p class="text-sm text-red-700">{fields.branchIds}</p>{/if}
			<div class="flex flex-wrap gap-4 text-sm">
				{#each merchant.branches as b (b.id)}
					<label class="flex items-center gap-2"><input type="checkbox" value={b.id} bind:group={branchIds} /> {b.name}</label>
				{/each}
			</div>
		</section>
	{/if}

	<section class="space-y-3">
		<h2 class="text-lg font-semibold">{t('admin.deal.coupons')}</h2>
		{#if fields.coupons}<p class="text-sm text-red-700">{fields.coupons}</p>{/if}
		{#each coupons as coupon, i (i)}
			<div class="flex flex-wrap items-end gap-2 rounded-lg border p-3">
				<label class="text-sm">
					<span class="block">{t('admin.coupon.code')}</span>
					<input class={small} bind:value={coupon.code} required maxlength="64" />
				</label>
				<label class="text-sm">
					<span class="block">{t('admin.coupon.kind')}</span>
					<select class={small} bind:value={coupon.kind}>
						<option value="copy">{t('admin.coupon.copy')}</option>
						<option value="show_qr">{t('admin.coupon.show_qr')}</option>
						<option value="auto_apply">{t('admin.coupon.auto_apply')}</option>
					</select>
				</label>
				<label class="text-sm">
					<span class="block">{t('admin.coupon.limit')}</span>
					<input class="{small} w-24" inputmode="numeric" bind:value={coupon.usageLimit} />
				</label>
				<button type="button" class="text-sm underline" onclick={() => coupons.splice(i, 1)}>{t('admin.remove')}</button>
				{#if fields[`coupons.${i}.code`]}<p class="w-full text-sm text-red-700">{fields[`coupons.${i}.code`]}</p>{/if}
			</div>
		{/each}
		<button
			type="button"
			class="rounded-lg border px-3 py-1.5 text-sm"
			onclick={() => coupons.push({ code: '', kind: 'copy', usageLimit: '', validFrom: '', validTo: '' })}
		>
			{t('admin.coupon.add')}
		</button>
	</section>

	<section class="space-y-4">
		<h2 class="text-lg font-semibold">{t('admin.deal.details')}</h2>
		<div class="grid gap-4 md:grid-cols-2">
			<ImageField label={t('admin.deal.image')} kind="deals" {supabaseUrl} bind:value={imageKey} error={fields.imageKey} />
			<ImageField label={t('admin.deal.proof')} kind="deals" {supabaseUrl} bind:value={proofImageKey} error={fields.proofImageKey} />
		</div>
		<Field label={t('admin.deal.terms')} error={fields.terms}>
			<textarea class={input} rows="4" bind:value={terms} maxlength="4000"></textarea>
		</Field>
		<Field label={t('admin.deal.how_to_redeem')} error={fields.howToRedeem}>
			<textarea class={input} rows="2" bind:value={howToRedeem} maxlength="2000"></textarea>
		</Field>
		<div class="grid gap-4 md:grid-cols-2">
			<Field label={t('admin.deal.source_url')} error={fields.sourceUrl} hint={t('admin.deal.source_hint')}>
				<input class={input} type="url" bind:value={sourceUrl} placeholder="https://" />
			</Field>
			<Field label={t('admin.deal.verification')} error={fields.verification}>
				<select class={input} bind:value={verification}>
					<option value="verified">{t('admin.verification.verified')}</option>
					<option value="unverified">{t('admin.verification.unverified')}</option>
					<option value="community">{t('admin.verification.community')}</option>
				</select>
			</Field>
		</div>
		<label class="flex items-center gap-2 text-sm"><input type="checkbox" bind:checked={isFeatured} /> {t('admin.deal.featured')}</label>
	</section>

	<button type="submit" class="rounded-lg bg-black px-4 py-2 font-medium text-white">{t('admin.save')}</button>
</form>
