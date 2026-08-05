"""Initial schema

Revision ID: 0001_initial
Revises: 
Create Date: 2026-08-05
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "admin_users",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("username", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("algo", sa.String(), nullable=False),
        sa.Column("iterations", sa.Integer(), nullable=False),
        sa.Column("salt", sa.String(), nullable=False),
        sa.Column("hash", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=False), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("username"),
    )
    op.create_index("ix_admin_users_username", "admin_users", ["username"], unique=False)

    op.create_table(
        "hero_config",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("enabled", sa.Boolean(), nullable=False),
        sa.Column("promo_type", sa.String(), nullable=True),
        sa.Column("promo_schedule", sa.JSON(), nullable=True),
        sa.Column("pill", sa.JSON(), nullable=True),
        sa.Column("title_one", sa.JSON(), nullable=True),
        sa.Column("title_two", sa.JSON(), nullable=True),
        sa.Column("text", sa.JSON(), nullable=True),
        sa.Column("primary", sa.JSON(), nullable=True),
        sa.Column("secondary", sa.JSON(), nullable=True),
        sa.Column("images", sa.JSON(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "products",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("category", sa.String(), nullable=False),
        sa.Column("name", sa.JSON(), nullable=False),
        sa.Column("price", sa.Numeric(10, 2), nullable=False),
        sa.Column("short", sa.JSON(), nullable=True),
        sa.Column("description", sa.JSON(), nullable=True),
        sa.Column("image", sa.String(), nullable=True),
        sa.Column("tags", sa.JSON(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "orders",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("product_id", sa.String(), nullable=False),
        sa.Column("qty", sa.Integer(), nullable=False),
        sa.Column("unit_price", sa.Numeric(10, 2), nullable=False),
        sa.Column("unit_cost", sa.Numeric(10, 2), nullable=False),
        sa.Column("category", sa.String(), nullable=True),
        sa.Column("name", sa.JSON(), nullable=True),
        sa.Column("personalization", sa.JSON(), nullable=True),
        sa.Column("customer", sa.JSON(), nullable=False),
        sa.Column("shipping", sa.JSON(), nullable=False),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], name="fk_orders_product_id_products"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "inventory",
        sa.Column("product_id", sa.String(), nullable=False),
        sa.Column("stock", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], name="fk_inventory_product_id_products"),
        sa.PrimaryKeyConstraint("product_id"),
    )

    op.create_table(
        "product_costs",
        sa.Column("product_id", sa.String(), nullable=False),
        sa.Column("unit_cost", sa.Numeric(10, 2), nullable=False),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], name="fk_product_costs_product_id_products"),
        sa.PrimaryKeyConstraint("product_id"),
    )

    op.create_table(
        "app_state",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("revision", sa.Integer(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=False), nullable=False),
        sa.Column("state", sa.JSON(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "admin_sessions",
        sa.Column("token", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=False), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=False), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["admin_users.id"], name="fk_admin_sessions_user_id_admin_users"),
        sa.PrimaryKeyConstraint("token"),
    )
    op.create_index("ix_admin_sessions_user_id", "admin_sessions", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_admin_sessions_user_id", table_name="admin_sessions")
    op.drop_table("admin_sessions")
    op.drop_table("app_state")
    op.drop_table("product_costs")
    op.drop_table("inventory")
    op.drop_table("orders")
    op.drop_table("products")
    op.drop_table("hero_config")
    op.drop_index("ix_admin_users_username", table_name="admin_users")
    op.drop_table("admin_users")
